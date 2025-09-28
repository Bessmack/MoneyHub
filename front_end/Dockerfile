# Use Nginx to serve the already-built React app
FROM nginx:alpine

# Copy build output (make sure you've run `npm run build` locally first)
COPY dist /usr/share/nginx/html

# Add nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
CMD ["nginx", "-g", "daemon off;"]
