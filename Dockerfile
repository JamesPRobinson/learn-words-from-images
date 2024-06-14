FROM node:18-slim

# Copy local code to the container image.
COPY . ./

RUN npm install
RUN npm run build

# Run the web service on container startup.
ENTRYPOINT [ "npm", "start" ]