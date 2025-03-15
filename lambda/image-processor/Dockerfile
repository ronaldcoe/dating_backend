# Use Amazon Linux 2023 for Lambda-compatible environment
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install core build dependencies
RUN dnf update -y && \
    dnf install -y \
    gcc-c++ \
    make \
    zip \
    unzip \
    git \
    wget \
    python3 \
    which \
    tar \
    xz \
    libstdc++ \
    glibc-devel \
    nodejs \
    npm \
    # Additional dependencies for Sharp
    libpng-devel \
    libjpeg-devel \
    librsvg2-devel

# Set up working directory
WORKDIR /build

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .  

# Create output directory and deployment package
RUN mkdir -p /output && \
    # Remove any existing node_modules to ensure clean install
    rm -rf node_modules && \
    # Reinstall production dependencies to rebuild native modules
    npm ci --only=production && \
    # Create zip package for Lambda
    zip -r /output/function.zip . \
    -x '*.git*' \
    -x 'node_modules/.bin/*' \
    -x 'node_modules/*/test/*' \
    -x 'node_modules/*/docs/*' \
    -x 'node_modules/*/examples/*'

# Verify the zip file was created
RUN ls -l /output/function.zip

# Create a shell script to copy the file
RUN echo '#!/bin/bash' > /copy-zip.sh && \
    echo 'cp /output/function.zip /host-output/function.zip' >> /copy-zip.sh && \
    chmod +x /copy-zip.sh

# Default command to copy the zip to host output
CMD ["/copy-zip.sh"]