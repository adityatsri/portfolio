# TSA Portfolio — Tadury Srinivas Aditya
Netflix-style portfolio for a Videographer, Photographer & Video Editor.

---

## Features
- **Public** homepage: Hero slideshow, 3 category rows (Videographer / Photographer / Video Editing), Contact, Footer
- **Admin** dashboard (password-protected): Upload, Manage, Settings
- YouTube links with auto-thumbnail + direct video/image upload with custom thumbnails
- Framer Motion animations throughout
- MongoDB Atlas + Cloudinary storage — deploys free on Render

---

## Local Setup

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Create `.env` (root folder)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=some_long_random_string
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
```

### 3. Run in development
```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd client && npm start
```

---

## Deploy to Render (Free Tier)

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `.env.example`
7. Deploy!

> **Note:** Render free tier sleeps after 15 min of inactivity — the first request after sleep takes ~30s to wake.

---

## Admin Access
- URL: `https://your-app.onrender.com/admin`
- **Default password:** `adhi@admin2024`
- Change it immediately in Admin → Settings → Change Password

---

## Services Needed (all free tiers)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [MongoDB Atlas](https://cloud.mongodb.com) | Database | 512 MB |
| [Cloudinary](https://cloudinary.com) | Media storage | 25 GB |
| [Render](https://render.com) | Hosting | 750 hrs/month |

---

## Project Structure
```
adhi_portfolio/
├── server.js          # Express entry point
├── package.json
├── render.yaml        # Render deploy config
├── middleware/auth.js # JWT middleware
├── models/
│   ├── Video.js       # Video / photo schema
│   └── Settings.js    # Site settings schema
├── routes/
│   ├── auth.js        # POST /api/auth/login
│   ├── videos.js      # CRUD /api/videos
│   └── settings.js    # GET|PUT /api/settings
└── client/            # React app
    └── src/
        ├── pages/
        │   ├── Home.js
        │   ├── AdminLogin.js
        │   └── AdminDashboard.js
        └── components/
            ├── Navbar.js
            ├── Hero.js
            ├── VideoRow.js
            ├── VideoCard.js
            ├── VideoModal.js
            ├── Contact.js
            └── Footer.js
```
