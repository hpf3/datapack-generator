## Build and serve the project using Nginx
##
## This Dockerfile performs a multi‑stage build.  The first stage uses a
## Node image to install dependencies and generate a production build of
## the app using the `npm run build` script.  The second stage uses the
## lightweight `nginx:alpine` image to serve the static files from the
## `dist` directory.  A custom Nginx configuration is included to
## support single‑page application (SPA) routing, sending all unknown
## routes back to `index.html`.

### Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for efficient caching
COPY package*.json ./

# Install dependencies (include dev dependencies for build)
RUN npm install --production=false

# Copy the rest of the source code
COPY . .

# Build the production bundle into the `dist` directory
RUN npm run build

### Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy the build output from the previous stage to Nginx's html directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to enable SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

LABEL org.opencontainers.image.source https://github.com/hpf3/datapack-generator
# Expose port 80 (the default HTTP port for Nginx)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
