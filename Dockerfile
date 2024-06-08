# Use the official NodeJS image.
# https://hub.docker.com/_/node
FROM node:16-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN npm install --only=production
RUN npm run build

# Run the web service on container startup.
ENTRYPOINT [ "npm", "start" ]