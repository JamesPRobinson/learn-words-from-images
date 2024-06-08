FROM node:18-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN npm install 
RUN npm run build

# Run the web service on container startup.
ENTRYPOINT [ "npm", "start" ]