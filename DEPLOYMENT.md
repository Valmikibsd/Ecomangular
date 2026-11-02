# Deployment Guide for Aura Mart (Angular Production Build)

The production build is packaged in:
`dist/ecom-frontend/browser`

---

## 1. IIS / Windows Server / Azure App Service
1. Copy all contents of `dist/ecom-frontend/browser` into your IIS site directory (e.g., `C:\inetpub\wwwroot\auramart`).
2. Ensure the IIS **URL Rewrite Module** is installed on the server.
3. The included `web.config` will automatically route client routes (`/shop`, `/login`, `/register`) to `index.html`.

---

## 2. Nginx
Copy the files in `dist/ecom-frontend/browser` to your web root (e.g. `/var/www/auramart/`).
Use the following server block configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/auramart;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|otf|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```

---

## 3. Apache
1. Copy the files in `dist/ecom-frontend/browser` to `/var/www/html/` (or your VirtualHost DocumentRoot).
2. Ensure `mod_rewrite` is enabled:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```
3. The included `.htaccess` file automatically redirects SPA routes to `index.html`.

---

## 4. AWS S3 + CloudFront / Azure Blob Storage
1. Upload all files from `dist/ecom-frontend/browser` to the root of your storage bucket or `$web` container.
2. Under Static Website Hosting, set:
   - **Index document**: `index.html`
   - **Error document**: `index.html` (to support direct SPA routing)

---

## 5. Docker (Nginx Alpine)
A minimal `Dockerfile`:

```dockerfile
FROM nginx:alpine
COPY dist/ecom-frontend/browser /usr/share/nginx/html
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
