FROM alpine
RUN apk add --no-cache nodejs npm

# Copy package.json and package-lock.json to the container
COPY package*.json /run/
WORKDIR /run

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /run

# Expose the port the app listens on
EXPOSE 5000

# Start the application
ENTRYPOINT ["node", "src/index.js"]
