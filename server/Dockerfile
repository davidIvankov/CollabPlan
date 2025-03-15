# Use an official Node.js image as the base image
FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci


# Copy over the server source code
COPY server/ server/

# Build the server
WORKDIR /app/server
RUN npm run build
# Expose the necessary port
EXPOSE 3000

# Start the server using the "prod" script
CMD ["npm", "run", "prod"]
