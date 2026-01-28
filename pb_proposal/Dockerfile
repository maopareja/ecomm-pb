FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Optional: Custom Nginx config if needed, but default is usually fine for simple static
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
