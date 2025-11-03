# Use an official Node.js runtime as a parent image
FROM node:latest


WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000
  # Command to run the application
CMD ["node", "server.js"] # Replace server.js with your main entry file