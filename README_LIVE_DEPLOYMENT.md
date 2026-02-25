# SAP Security Expert - Live Deployment Guide

This guide provides step-by-step instructions for deploying the SAP Security Expert application to a live production server (e.g., Hostinger, cPanel, or any Apache/Nginx hosting environment).

## 1. Prerequisites

- **Node.js**: Installed on your local machine to build the React application.
- **PHP 8.x +**: Configured on your live hosting server.
- **MySQL or MariaDB**: Configured on your live hosting server.
- **Apache Server**: Preferred, as the provided `.htaccess` utilizes `mod_rewrite` for routing strings securely.

---

## 2. Prepare the Application (Local Machine)

Before uploading files to the server, you need to create an optimized production build of the React frontend.

1. Open your terminal and navigate to the root directory of the project (`sap-security-expert-new`).
2. Run the build command:
   ```bash
   npm run build
   ```
3. A new `dist/` folder will be generated. This folder contains your minified, production-ready frontend code.

---

## 3. Database Setup & Migration (Live Server)

Your local development database uses SQLite, but your live server will use MySQL. To make this transition seamless, we have generated a MySQL-compatible migration file for you.

1. Log into your hosting control panel (e.g., cPanel).
2. Go to **MySQL Databases**.
3. Create a new Database and a new Database User.
4. Add the User to the Database and grant **ALL PRIVILEGES**.
5. Keep note of the following credentials, as you'll need them in Step 4:
   - Database Host (usually `localhost`)
   - Database Name
   - Database User
   - Database Password
6. Open **phpMyAdmin** and select your newly created database.
7. Click the **Import** tab.
8. Choose the `api/production_database.sql` file provided in this project folder.
   - _This file contains your entire local database structure, including all your sample blogs, users, comments, and configuration, translated perfectly for MySQL._
   - If you ever need to generate a fresh export from your local machine before uploading, simply run `php api/export_mysql.php` in your terminal.

---

## 4. Uploading to the Server

You will upload a combination of your built React files and your PHP backend files to the `public_html` directory (or the designated root folder for your domain/subdomain).

### Required Files Structure

Your live server root MUST look exactly like this:

```text
public_html/
│
├── api/                    <-- Upload the entire local 'api' folder here
│   ├── .env                <-- YOU MUST CREATE THIS FILE (See below)
│   ├── db.php
│   └── ...
│
├── uploads/                <-- Critical: Image storage (See Step 5)
│   ├── blogs/
│   ├── contributors/
│   └── ads/
│
├── assets/                 <-- From your local 'dist' folder
├── ...                     <-- Other files from your local 'dist' folder (e.g., favicon.ico)
│
├── index.php               <-- Upload from local root (Handles Dynamic SEO)
└── .htaccess               <-- Upload from local root (Handles routing)
```

### Upload Steps:

1. Open the File Manager in your hosting panel (or use FTP).
2. Navigate to your domain's root folder (`public_html` or `sap.kaphi.in/`).
3. Upload everything INSIDE your local `dist/` folder (but **do not upload the index.html file**, delete it if you do).
   - _Why? Because `index.php` replaces `index.html` to inject dynamic SEO tags for social media sharing._
4. Upload the local `api/` folder.
5. Upload the `index.php` file from your local project root.
6. Upload the `.htaccess` file from your local project root.
   - _Note: Ensure hidden files are visible in your file manager so you don't miss `.htaccess`._

### Configure the Database Connection

Inside the `api/` folder on your live server, create a file named `.env`.

Add the following lines and replace the placeholders with the credentials you generated in Step 3:

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_NAME=your_live_database_name
DB_USER=your_live_database_user
DB_PASS=your_live_database_password
```

---

## 5. Setting Up Upload Paths & Permissions (CRITICAL)

The application handles dynamic image uploads (blog headers, contributor photos, advertisement banners). These files require specific folders with write permissions.

1. In your server's root folder (`public_html/`), create a folder named `uploads`.
2. Inside `uploads/`, create the following three subfolders:
   - `blogs`
   - `contributors`
   - `ads`
3. **Set Permissions**: You must ensure the server has permission to save files here.
   - Right-click the `uploads/` folder and change permissions to `0755`.
   - Apply `0755` permissions to the three subfolders as well.
   - _(Note: If image uploads fail on your specific host, you may temporarily try `0777`, but `0755` is the standard secure setting)._

---

## 6. Final Verification

1. **Test Frontend Routing**: Visit your live domain (e.g., `https://sap.kaphi.in/`). Navigate through the pages to ensure the React app loads correctly.
2. **Test SEO Routing**:
   - Go to a specific blog post URL (e.g., `https://sap.kaphi.in/blogs/fiori-security-best-practices`).
   - Right-click the page and select **"View Page Source"**.
   - Look for the `<meta property="og:title"...>` tags. If they display the actual blog title (not a generic fallback), your `index.php` and `.htaccess` routing is working perfectly.
3. **Test API & Database**:
   - Go to `https://sap.kaphi.in/admin`.
   - Attempt to log in to ensure `api/login.php` connects to the database.
4. **Test Image Uploads**:
   - Inside the admin panel, create a draft blog post and upload a header image.
   - If the image saves and previews successfully, your `uploads/` folder paths and permissions are correct.

---

### Troubleshooting

- **Server returns a 500 Internal Error**: This is almost always an issue with the `.env` file credentials being incorrect, or a syntax error in the `.htaccess` file.
- **Images upload but don't display**: Ensure the `uploads/` folders are accurately spelled and sit in the very root of the domain alongside `index.php`.
- **404 Not Found on Page Refresh / APIs**: Your `.htaccess` file is either missing or `mod_rewrite` is not enabled on your Apache server. Contact your host to enable `mod_rewrite`.
