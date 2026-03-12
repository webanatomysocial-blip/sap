# SAP Security Expert - Project Overview & Analysis

The **SAP Security Expert** application is a professional blogging and community platform dedicated to SAP security, governance, and compliance. It features a modern React-based frontend and a robust PHP backend with a focus on SEO, performance, and role-based access control (RBAC).

## 🚀 Tech Stack
- **Frontend**: React 19 (Vite), React Router 7, GSAP (Animations), Axios, Lenis (Smooth Scroll).
- **Backend**: PHP 8.x (Vanilla PHP with Service Layer Architecture).
- **Database**: 
  - **Local**: SQLite (`database.sqlite`).
  - **Production**: MySQL/MariaDB (Migration-ready via `api/production_database.sql`).
- **Server**: Apache (via `.htaccess`) or PHP CLI Server.
- **Key Integrations**: PlagiarismCheck.org API, SMTP (for mail), local image storage.

---

## 📂 Project Structure
<details>
<summary>View Directory Tree</summary>

```text
├── api/                    # Backend logic (PHP)
│   ├── middleware/         # Rate limiting, etc.
│   ├── services/           # Service Layer (Blog, Cache, Audit, Announcement)
│   ├── db.php              # Multi-adapter DB connection & CORS
│   ├── index.php           # Central API Router
│   ├── utils.php           # Shared logic (Plagiarism, SEO score, File cleanup)
│   └── .env                # Environment configuration
├── src/                    # Frontend source (React)
│   ├── components/         # Reusable UI & Layouts
│   ├── context/            # Auth, Toast, Member contexts
│   ├── css/                # Component-specific styles
│   ├── pages/              # View components (Home, Blogs, Legal)
│   ├── services/           # API communication (Axios)
│   ├── App.jsx             # Main router
│   └── main.jsx            # Entry point
├── public/                 # Static assets & Uploads
├── .htaccess               # Apache routing & security rules
├── router.php              # Local dev router (SEO injection)
├── index.php               # Frontend SEO wrapper
└── package.json            # Frontend dependencies
```
</details>

---

## 🛠️ Key Components Breakdown

### Frontend (`/src`)
- **State Management**: Centralized in `AuthContext` (admin) and `MemberAuthContext` (public).
- **Routing**: Sophisticated routing with 19+ categories for fine-grained content organization.
- **API Layer**: Centralized `api.js` with CSRF protection and error interceptors.

### Backend (`/api`)
- **Service Layer**: Decoupled business logic in `api/services` (Blog, Cache, Audit).
- **Security Middleware**: `auth_check.php` and `permission_check.php` provide granular RBAC.
- **Advanced Features**: Integrated plagiarism checking, SEO scoring, and a shadow "Draft" system for non-admin contributors.

---

## 🔄 Data Flow
1. **User Interaction**: User engages with the React UI.
2. **API Interaction**: Frontend hits endpoints via Axios; PHP router catches and dispatches to specific handlers.
3. **Logic & DB**: Service layer processes requests and interacts with SQLite/MySQL.
4. **Response**: JSON payloads return, triggering React state updates and animations.

---

## 🛡️ Security Architecture
- **RBAC**: Multi-role support (Admin, Contributor, Guest) with granular permissions.
- **CSRF Protection**: Mandatory token validation for all mutating requests.
- **Data Protection**: Prepared statements (PDO) used throughout to prevent SQL Injection.
- **SEO Injection**: Custom PHP wrapper (`index.php` root) ensures dynamic social media tags even with a SPA architecture.

---

## 📝 Recommendations
1. **Migrations**: Keep `api/export_mysql.php` updated during development.
2. **Environment**: Ensure `api/.env` is correctly configured for production.
3. **Logging**: Monitor `php-server.log` and `mail_log.txt` for issues.
