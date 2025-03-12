#!/bin/bash

# Update system packages and install required dependencies
apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2

# Run your usual build command (if any)
npm install
