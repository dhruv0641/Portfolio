# DHRUV.SEC — Portfolio Transformation Report

## Before → After Comparison

---

### IDENTITY & BRANDING

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Name** | Meet Kothiya | **Dhruv Dobariya** |
| **Logo** | MK.DEV | **DHRUV.SEC** |
| **Role** | AAA Game Developer | **Cybersecurity Analyst \| SOC Enthusiast \| Cloud & AI Security** |
| **Tagline** | "Crafting immersive game experiences" | **"Defending the Digital Frontier"** |
| **Email** | (placeholder) | **dobariyadhurvvipulbhai@gmail.com** |
| **Location** | (none) | **Surat, Gujarat, India** |
| **LinkedIn** | (none) | **linkedin.com/in/dhruvdobariya** |
| **GitHub** | (none) | **github.com/dhruvdobariya** |

---

### CONTENT SECTIONS

| Section | BEFORE | AFTER |
|---------|--------|-------|
| **Hero** | Game dev intro, "View Projects" CTA | **Cybersecurity intro, Google Certified badge, "View Security Projects" + "Contact Me" CTAs** |
| **About** | Game development skills (Unity, Unreal, C++) | **SOC Analyst bio, SIEM/IR/Cloud/AI expertise, 6 expertise cards** |
| **Services** | Game dev services (3D, optimization, etc.) | **6 cybersecurity services: Log Investigation, SOC Triage, Vuln Assessment, Docs, Secure API, AI Security** |
| **Projects** | 4 game titles with screenshots | **4 security labs: SOC Lab, Phishing Detection, Network Analyzer, AI Threat Reporter** |
| **Partners** | Gaming companies logos | **Certifications: Google Cybersecurity, SIEM, Network Security, Cloud Security, .NET Core** |
| **Contact** | Generic form | **Cybersecurity-themed contact with real email, location, LinkedIn** |
| **Footer** | © Meet Kothiya | **© 2026 Dhruv Dobariya** |

---

### VISUAL THEME

| Element | BEFORE | AFTER |
|---------|--------|-------|
| **Primary Color** | Purple (#4f46e5, #9333ea) | **Cyan (#06b6d4) + Emerald (#10b981)** |
| **Glow Effects** | Purple glow | **Cyan/teal glow** |
| **3D Particles** | Purple (#8781f7) | **Cyan (#06b6d4)** |
| **Loading Screen** | Purple gradient line | **Cyan → Emerald gradient line** |
| **Hero Glow** | Purple text shadow | **Cyan + Emerald text shadow** |
| **Scrollbar** | Purple | **Cyan** |

---

### TECHNICAL ADDITIONS

#### Admin Dashboard (NEW — Phase 3)
- **Backend API**: Express.js + JWT authentication on `http://localhost:4000`
- **CRUD Operations**: Full create/read/update/delete for Projects, Services, Messages
- **Dashboard Overview**: Stats cards (projects, featured, services, messages, unread)
- **Settings Panel**: Brand settings, SEO settings, password change
- **Message Management**: View, mark read, delete contact form submissions
- **Authentication**: JWT tokens with 24h expiry, bcrypt password hashing
- **Rate Limiting**: 100 req/15min general, 10 req/15min login attempts

#### Security Hardening (Phase 4)
- **Input Sanitization**: XSS prevention via `<>` stripping on all user inputs
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`
- **Helmet.js**: Comprehensive HTTP security headers on API
- **CORS**: Restricted to known origins (localhost:3000, 4200)
- **Environment Variables**: JWT_SECRET via env, `.env.example` provided
- **`.gitignore`**: Excludes `admin-api/data/`, `.env` files, secrets
- **Contact Service**: Real API integration with fallback, client-side validation

---

## Final Project Structure

```
websiteprotefolio/
├── index.html              # Angular root (cybersecurity themed)
├── index.tsx               # Angular entry point
├── angular.json            # Angular config (port 3000)
├── package.json            # dhruv-dobariya-cybersecurity-portfolio
├── metadata.json           # Updated metadata
├── tsconfig.json           # TypeScript config
├── .gitignore              # Updated with security exclusions
│
├── src/                    # Angular components
│   ├── app.component.ts/html/css
│   ├── components/
│   │   ├── hero/           # Cybersecurity hero with VFX
│   │   ├── about/          # SOC Analyst bio + 8 expertise items
│   │   ├── services/       # 6 cybersecurity services
│   │   ├── projects/       # 4 security lab projects
│   │   ├── partners/       # → Certifications & Learning
│   │   ├── contact/        # Contact form (→ API integrated)
│   │   ├── loading-screen/ # DHRUV.SEC cyan/emerald loader
│   │   ├── lottie-player/  # Lottie animation wrapper
│   │   └── three-d-background/ # Cyan 3D particles
│   └── services/
│       └── contact.service.ts  # Real API + fallback
│
├── new   website/          # Static HTML version
│   ├── index.html          # Full cybersecurity portfolio
│   ├── style.css           # Cyan/purple design tokens
│   ├── main.js             # Loader, nav, form, VFX
│   └── particles.js        # Canvas particle animation
│
├── admin/                  # Admin Dashboard (NEW)
│   ├── index.html          # Dashboard entry point
│   ├── admin.css           # Dark theme dashboard styles
│   └── admin.js            # SPA: login, CRUD, settings
│
└── admin-api/              # Backend API (NEW)
    ├── package.json        # Express + JWT + bcrypt
    ├── server.js           # REST API with auth
    ├── .env.example        # Environment template
    └── data/               # JSON file storage (auto-created)
        ├── admin.json      # Admin credentials (hashed)
        ├── projects.json   # Projects data
        ├── services.json   # Services data
        ├── messages.json   # Contact submissions
        └── settings.json   # Brand & SEO config
```

---

## How to Run

### Static Portfolio (Quick View)
```bash
# Open in browser directly
start "new website/index.html"
```

### Angular Portfolio
```bash
npm install --legacy-peer-deps
npx ng serve
# → http://localhost:3000
```

### Admin Dashboard
```bash
# 1. Start the API server
cd admin-api
npm install
node server.js
# → http://localhost:4000

# 2. Open admin dashboard in browser
start admin/index.html

# Default login: admin / admin123
# ⚠️ CHANGE PASSWORD IMMEDIATELY after first login!
```

### API Endpoints Reference
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/dashboard/stats` | Yes | Dashboard overview |
| GET | `/api/projects` | No | List all projects |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| GET | `/api/services` | No | List services |
| POST | `/api/services` | Yes | Create service |
| PUT | `/api/services/:id` | Yes | Update service |
| DELETE | `/api/services/:id` | Yes | Delete service |
| GET | `/api/messages` | Yes | List messages |
| POST | `/api/messages` | No | Submit contact form |
| PATCH | `/api/messages/:id/read` | Yes | Mark as read |
| DELETE | `/api/messages/:id` | Yes | Delete message |
| GET | `/api/settings` | No | Get settings |
| PUT | `/api/settings` | Yes | Update settings |
| GET | `/api/health` | No | Health check |

---

## Files Modified (23 files)

### Phase 1-2: Content & Rebranding
1. `metadata.json` — Title updated
2. `package.json` — Package name updated
3. `index.html` — SEO, security headers, cyan theme
4. `src/app.component.html` — Footer copyright
5. `src/components/hero/hero.component.html` — Full cybersecurity rewrite
6. `src/components/hero/hero.component.css` — Cyan/emerald glow
7. `src/components/loading-screen/loading-screen.component.html` — DHRUV.SEC
8. `src/components/loading-screen/loading-screen.component.css` — Cyan gradient
9. `src/components/about/about.component.html` — SOC Analyst bio
10. `src/components/about/about.component.ts` — 8 expertise items
11. `src/components/services/services.component.html` — Cybersecurity header
12. `src/components/services/services.component.ts` — 6 security services
13. `src/components/projects/projects.component.html` — Security lab cards
14. `src/components/projects/projects.component.ts` — 4 security projects
15. `src/components/partners/partners.component.html` — Certifications
16. `src/components/contact/contact.component.html` — Cybersecurity contact
17. `src/components/three-d-background/three-d-background.component.ts` — Cyan particles
18. `src/services/contact.service.ts` — Real API integration + sanitization
19. `new website/index.html` — Full cybersecurity rewrite
20. `new website/style.css` — Updated header + project styles
21. `new website/main.js` — Updated header + button text
22. `.gitignore` — Security exclusions

### Phase 3-4: New Files Created
23. `admin-api/package.json` — Backend dependencies
24. `admin-api/server.js` — Express API with JWT auth
25. `admin-api/.env.example` — Environment template
26. `admin/index.html` — Dashboard entry point
27. `admin/admin.css` — Dashboard styles
28. `admin/admin.js` — Dashboard SPA application

---

*Generated: February 2026*
*Portfolio: DHRUV.SEC — Dhruv Dobariya Cybersecurity Portfolio*
