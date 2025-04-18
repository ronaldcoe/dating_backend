# Tech stack
- Node 20.15.1
- Express
- Prisma

# Setup
1. Install all dependencies `npm install`
2. Setup the local database:
### Local Database Setup  

To create a local PostgreSQL database and apply your Prisma schema, follow these steps:  

1. **Ensure PostgreSQL is running** on your local machine.  
2. **Create the database manually** using the PostgreSQL CLI:  

   ```sh
   createdb -U <your_username> dating_app
   ```

   If `createdb` is not found, you can also create the database inside the PostgreSQL interactive shell:  

   ```sh
   psql -U <your_username>
   CREATE DATABASE dating_app;
   ```

3. **Set up your `.env` file** with the database connection string:  

   ```env
   DATABASE_URL="postgresql://<your-user>:<your-password>@localhost:5432/dating_app?schema=public"
   ```

4. **Run Prisma Schema** to create the tables from your `schema.prisma` file:  

   ```sh
   npx prisma db push
   ```

   This will generate the necessary database schema and apply migrations.  

5. **Verify the database structure** using Prisma Studio:  

   ```sh
   npx prisma studio
   ```
Now you can run the app with `npm run dev`
# Running Tests  

We use **Jest** as our testing framework. To run the test suite, execute the following command:  

```sh
npm run test
```  

**Important:** Before running tests, update the `DATABASE_URL` in `.env.test`. The test suite expects `dating_app_test` to be the testing database. While the test command will create the database, you must ensure that the URL is correctly set.  

# AWS  
To test the AWS implementation locally without using the staging version of the app, you can use ngrok.  

Run the following command in the terminal after starting the backend:  

```sh
ngrok http <PORT>
```  

This will generate a **Forwarding** link. Replace this link in your `.env` file and also in the Lambda environment.  

To update it in AWS:  
1. Go to **Lambda** and select the function.  
2. Click the **Configuration** tab and select **Environment variables**.  
3. Update the `WEBHOOK_URL` with the new forwarding link.  

Note that this forwarding link is only valid for a few hours. Once you're done with development, remember to revert it back to the staging URL.

### AWS S3 and Lambda Configuration  

If you need to create a new S3 bucket or Lambda function for processing and audit images, follow these steps:  

1. **Create an S3 Bucket**  
   - Choose a name for the bucket.  
   - Update the `.env` file by setting the `AWS_S3_BUCKET` key to the new bucket name.  

2. **Create a Lambda Function**  
   - Set the runtime to **Node.js 22.x**.  
   - Choose **x86_64** as the architecture.  

3. **Deploy the Lambda Function**  
   - Navigate to the Lambda function directory in your terminal:  
     ```sh
     cd lambda/image-processor
     ```  
   - Build the deployment package:  
     ```sh
     docker build --platform linux/amd64 -t lambda-deployment-builder .  
     ```  
   - Generate the `function.zip` file:  
     ```sh
     docker run --rm -v $(pwd)/output:/host-output lambda-deployment-builder
     ```  

4. **Upload the Lambda Function Code**  
   - In the AWS Lambda console, go to the **Code** tab.  
   - Click **Upload from > .zip file**.  
   - Upload the `function.zip` file you just created.  

5. **Set Permissions**  
   - Go to the **Configuration** tab and open the **Permissions** section.  
   - Click the role name under **Execution role**, which opens a new window.  
   - In the **Permissions policies** section, attach the following policies:  
     - `AmazonRekognitionReadOnlyAccess`  
     - `AmazonS3FullAccess`  

   These permissions allow the Lambda function to interact with S3 for image processing.  

6. **Configure Triggers**  
   - In the **Configuration** tab, open the **Triggers** section.  
   - Click **Add trigger**, select **S3**, and choose the bucket you want to use.  

7. **Adjust Memory and Timeout**  
   - Go to the **Configuration** tab, select **General configuration**, and click **Edit**.  
   - Ensure the function has enough memory and an adequate timeout setting. The default values may be too low.  

## Other LAMBDA functions
### Delete expired reset password tokens
`/lambda/delete-expired-tokens`
- This function deletes expired tokens for reseting password
<br></br>

**Configuration**
- Run this command inside the directory `zip -r deployment.zip index.js node_modules package.json`
- Setup the right permissions for this function access the database in AWS RDS

### S3 Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::767398139169:user/ronaldcoello"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::datingapp-staging",
                "arn:aws:s3:::datingapp-staging/*"
            ]
        },
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::datingapp-staging",
                "arn:aws:s3:::datingapp-staging/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                },
                "StringNotEquals": {
                    "aws:PrincipalArn": "arn:aws:iam::767398139169:user/ronaldcoello"
                }
            }
        }
    ]
}
```

### IAM permisions
You need this permissions to use the IAM user Access key and secret
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "s3:GetObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::datingapp-staging",
                "arn:aws:s3:::datingapp-staging/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction",
                "lambda:GetFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration"
            ],
            "Resource": "arn:aws:lambda:*:*:function:test"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

# Documentation
## Overview
The application uses a custom documentation system instead of Swagger UI. The documentation is generated and maintained in three key locations:

1. `/docs/doc.html` - The HTML file that serves as the documentation interface when accessing {base_url}/docs
2. `/public/doc-api.js` - JavaScript file that dynamically generates the documentation content and handles interactive features
3. `/public/api-spec.json` - JSON configuration file containing all API routes and

## Why Custom Documentation?
We've chosen to implement a custom documentation solution rather than using Swagger for the following reasons:

- Better visual integration with the application's design
- More flexible customization options for the UI
- Improved user experience for API exploration
- Modern interface compared to Swagger's default UI

## Managing Documentation
### Viewing Documentation
After running the application locally, you can access the documentation at:
`http://localhost:{PORT}/docs`

### Adding New Endpoints
To document a new API endpoint:

1. Open /public/api-spec.json
2. Add your new route definition within the appropriate resource section
3. Include responses with different status codes and example content

Example endpoint structure:
```json
{
  "type": "POST",
  "description": "Create a new match",
  "path": "/matches",
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer {token}",
      "required": true,
      "description": "JWT token"
    }
  ],
  "body": [
    {
      "key": "userId",
      "type": "integer",
      "value": 42,
      "required": true,
      "description": "ID of the user to match with"
    }
  ],
  "responses": {
    "201": {
      "description": "Match created successfully",
      "content": {
        "success": true,
        "message": "Match created successfully",
        "data": {
          "id": 15,
          "userId1": 7,
          "userId2": 42,
          "status": "PENDING",
          "createdAt": "2025-04-08T15:30:22.123Z"
        }
      }
    },
    "400": {
      "description": "Invalid input",
      "content": {
        "success": false,
        "message": "Invalid user ID",
        "errors": ["User ID must be a positive integer"]
      }
    }
  }
}
```


### Response Structure
Each endpoint can have multiple response examples based on status codes:

```json
"responses": {
  "200": {
    "description": "Success message",
    "content": {
      // Example response content
    }
  },
  "400": {
    "description": "Error message",
    "content": {
      // Example error content
    }
  }
}
```
The `content` property contains the exact JSON that will be returned by the API.
### Best Practices

1. Be Consistent with Status Codes: Use standard HTTP status codes (200 for success, 400 for bad requests, 401 for unauthorized, etc.)
2. Document All Possible Responses: Include both success and error responses for each endpoint
3. Use $ref for Repeated Structures: Define models once and reference them throughout the documentation
4. Include Request/Response Examples: Provide clear examples of what the API expects and returns
5. Keep Documentation Updated: Update the API spec whenever you modify endpoints

### Future Improvements
Consider implementing these enhancements:

1. Interactive Testing: Add a "Try it out" feature that lets users make API calls directly from the docs
2. Authentication Setup: Add a global authentication section where users can enter their tokens
