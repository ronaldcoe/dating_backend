const AWS = require('aws-sdk');
const sharp = require('sharp');
const axios = require('axios');

// Initialize AWS services
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

// Configuration from environment variables
const { 
  WEBHOOK_URL,
  WEBHOOK_SECRET,
  MODERATION_CONFIDENCE_THRESHOLD = '60' 
} = process.env;

// Wrap the existing handler in an export
exports.handler = async (event, context) => {
  // Process each record (S3 event)
  const results = await Promise.all(
    event.Records.map(async (record) => {
      try {
        // Get S3 bucket and key from the event
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        
        console.log(`Processing image from ${bucket}/${key}`);
        
        // Get object and metadata from S3
        const s3Object = await s3.getObject({
          Bucket: bucket,
          Key: key
        }).promise();
        
        // Extract metadata
        const metadata = s3Object.Metadata || {};
        const userId = metadata['user-id'];
        const photoId = metadata['photo-id'];
        
        if (!userId || !photoId) {
          throw new Error(`Missing user-id or photo-id in metadata for ${key}`);
        }
        
        // Moderate image content using Rekognition
        const moderationResult = await moderateImage(bucket, key);
        
        // If image fails moderation, notify application and don't process further
        if (!moderationResult.passed) {
          await notifyApplication({
            userId,
            photoId,
            status: 'REJECTED',
            moderationPassed: false,
            moderationMessage: moderationResult.reason
          });
          
          console.log(`Image rejected: ${moderationResult.reason}`);
          return {
            status: 'REJECTED',
            reason: moderationResult.reason
          };
        }
        
        // Process image to different sizes
        const imageBuffer = s3Object.Body;
        const [standardImage, thumbnailImage] = await Promise.all([
          processImage(imageBuffer, 600, 85),  // Standard size
          processImage(imageBuffer, 150, 80)   // Thumbnail size
        ]);
        
        // Upload processed images to S3
        const [standardResult, thumbnailResult] = await Promise.all([
          uploadToS3(standardImage, bucket, `processed/${userId}/standard-${photoId}.jpg`, 'image/jpeg'),
          uploadToS3(thumbnailImage, bucket, `processed/${userId}/thumbnail-${photoId}.jpg`, 'image/jpeg')
        ]);
        
        // Generate URLs for the processed images
        const baseUrl = `https://${bucket}.s3.${AWS.config.region}.amazonaws.com`;
        const standardUrl = `${baseUrl}/processed/${userId}/standard-${photoId}.jpg`;
        const thumbnailUrl = `${baseUrl}/processed/${userId}/thumbnail-${photoId}.jpg`;
        
        // Notify application that processing is complete
        await notifyApplication({
          userId,
          photoId,
          standardUrl,
          thumbnailUrl,
          status: 'COMPLETED',
          moderationPassed: true
        });
        
        console.log(`Successfully processed image for user ${userId}, photo ${photoId}`);
        
        return { 
          status: 'COMPLETED',
          photoId,
          standardUrl,
          thumbnailUrl
        };
      } catch (error) {
        console.error('Error processing image:', error);
        
        // Try to extract userId and photoId from metadata if possible
        let userId = null;
        let photoId = null;
        
        try {
          const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
          const bucket = record.s3.bucket.name;
          
          // Try to get metadata
          const s3Object = await s3.headObject({
            Bucket: bucket,
            Key: key
          }).promise();
          
          const metadata = s3Object.Metadata || {};
          userId = metadata['user-id'];
          photoId = metadata['photo-id'];
        } catch (e) {
          console.error('Error extracting metadata:', e);
        }
        
        // Notify application of failure if we have user and photo IDs
        if (userId && photoId) {
          await notifyApplication({
            userId,
            photoId,
            status: 'FAILED',
            moderationPassed: false,
            moderationMessage: error.message
          }).catch(e => console.error('Error notifying application:', e));
        }
        
        return { 
          status: 'FAILED',
          error: error.message
        };
      }
    })
  );
  
  return { results };
};

/**
 * Process image using Sharp
 */
async function processImage(buffer, size, quality) {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

/**
 * Upload buffer to S3
 */
async function uploadToS3(buffer, bucket, key, contentType) {
  return s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }).promise();
}

/**
 * Moderate image content using Rekognition
 */
async function moderateImage(bucket, key) {
  try {
    const params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      },
      MinConfidence: parseFloat(MODERATION_CONFIDENCE_THRESHOLD)
    };
    
    const moderationResponse = await rekognition.detectModerationLabels(params).promise();
    
    // Check if any moderation labels were found
    if (moderationResponse.ModerationLabels && moderationResponse.ModerationLabels.length > 0) {
      // Get the detected labels
      const labels = moderationResponse.ModerationLabels.map(label => label.Name);
      
      // Define categories that should be rejected
      const forbiddenCategories = [
        'Explicit Nudity', 
        'Nudity', 
        'Graphic Male Nudity', 
        'Graphic Female Nudity', 
        'Sexual Activity', 
        'Violence', 
        'Hate Symbols'
      ];
      
      // Check if any forbidden categories were detected
      const detectedForbidden = labels.filter(label => 
        forbiddenCategories.some(category => label.includes(category))
      );
      
      if (detectedForbidden.length > 0) {
        return {
          passed: false,
          reason: `Detected inappropriate content: ${detectedForbidden.join(', ')}`
        };
      }
    }
    
    // If no forbidden labels were found, the image passed moderation
    return { passed: true };
  } catch (error) {
    console.error('Error in content moderation:', error);
    
    // In case of error, assume the image is safe
    // You might want to handle this differently in production
    return { passed: true };
  }
}

/**
 * Notify application backend via webhook
 */
async function notifyApplication(data) {
  if (!WEBHOOK_URL) {
    console.log('No webhook URL configured, skipping notification');
    return;
  }
  
  try {
    await axios.post(WEBHOOK_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      }
    });
    
    console.log('Webhook notification sent successfully');
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    throw error;
  }
}

// Explicitly export the handler
module.exports = {
  handler: exports.handler
};