# Production Deployment Guide (Subdomain)

This package is optimized for deployment on `https://sap.kaphi.in` (Subdomain Root).

## 1. File Structure Setup

Ensure your subdomain root (`public_html/subdomain/`) looks like this:

```
subdomain/
├── api/                  # PHP Backend
├── assets/               # User uploads (ensure 755 permissions)
├── index.html            # React Frontend Entry
├── .htaccess             # Routing Rules
├── .env                  # Database Credentials (rename .env.example)
└── ... (other JS/CSS files)
```

## 2. Upload Instructions

1.  **Extract** `production_package.zip`.
2.  **Upload** all contents to your subdomain root folder.
3.  **Permissions**:
    - Set `api/` to `0755`.
    - Set `assets/` to `0755` (Create `assets/` manually if it doesn't exist).
    - Files should be `0644`.

## 3. Database Configuration

1.  Create a MySQL Database & User in cPanel.
2.  **Option A (Fresh Install)**: Import `database/full_database_install.sql`.
    - This sets up the full schema and creates the Admin user:
    - **User**: `admin`
    - **Pass**: `sap-security-2026`
3.  **Option B (Update Existing)**: Import `database/production_update.sql`.
4.  **Configure Environment**:
    - Rename `.env.example` to `.env` in the subdomain root.
    - Edit `.env` and fill in your database credentials:
      ```
      DB_HOST=localhost
      DB_NAME=your_db_name
      DB_USER=your_db_user
      DB_PASS=your_db_password
      ```

## 4. Security Verification

- **API Routing**: `.htaccess` is configured to handle clean URLs (e.g., `/api/login`).
- **Session Security**: Enabled in `db.php` (HttpOnly, Secure).
- **Uploads**: Restricted to images, max 5MB, stored in `assets/`.
- **Public access**: `api/` is accessible, config files are protected.

## 5. Troubleshooting

- If you see **404 on API calls**: Ensure `.htaccess` is uploaded and mod_rewrite is enabled.
- If **Database Error**: Check `.env` file credentials.
