FROM node:18-alpine

WORKDIR /app

# Add ARG for build-time variables
ARG REACT_APP_API_BASE_URL=http://localhost:5000

# Set environment variable
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]