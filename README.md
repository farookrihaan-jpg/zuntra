# PinVault 📌

A full-stack Pinterest-inspired visual discovery platform built with **React + Vite**, **Node.js + Express**, and **MongoDB**.

---

## ✦ Features

| Feature | Details |
|---|---|
| **Auth** | JWT-based register/login, bcrypt hashing, cookie + header token support |
| **Feed** | Infinite-scroll masonry grid, category filter, full-text search |
| **Pins** | Upload (Cloudinary), save/unsave, comments, related pins, view count |
| **Boards** | Create, manage, add/remove pins, public/private toggle |
| **Profiles** | Follow/unfollow, avatar upload, bio, stats |
| **Settings** | Edit profile, change password, avatar upload |
| **Security** | Helmet, CORS, rate limiting, input validation |

---

## 🗂 Project Structure

```
pinvault/
├── backend/
│   └── src/
│       ├── config/          # DB + Cloudinary setup
│       ├── controllers/     # Business logic (auth, pins, boards, users)
│       ├── middleware/       # JWT auth, error handler
│       ├── models/          # Mongoose schemas (User, Pin, Board)
│       ├── routes/          # Express routers
│       ├── utils/           # DB seeder
│       └── server.js        # Express entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── auth/        # AuthModal, ProtectedRoute
        │   ├── boards/      # BoardCard, CreateBoardModal
        │   ├── common/      # Modal, EmptyState, Spinner, Avatar, SectionHeader
        │   ├── layout/      # Layout, Navbar, Sidebar
        │   └── pins/        # PinCard, PinGrid, UploadModal, CategoryFilter
        ├── hooks/           # useDebounce, useClickOutside, useKeyPress, etc.
        ├── pages/           # HomePage, PinPage, ProfilePage, BoardsPage, etc.
        ├── store/           # Zustand stores (auth, pins, boards)
        ├── styles/          # Tailwind globals
        └── utils/           # api.js (Axios), helpers.js
```

---

## ⚡ Quick Start

### 1. Clone and install
```bash
git clone https://github.com/yourname/pinvault.git
cd pinvault
npm run install:all
```

### 2. Configure backend environment
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
```

Required `.env` values:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### 3. Seed the database (optional)
```bash
cd backend
npm run seed
# Demo login: mira@demo.com / password123
```

### 4. Run both servers
```bash
# From project root:
npm run dev
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout |
| GET  | `/api/auth/me` | ✓ | Get current user |
| PUT  | `/api/auth/updateprofile` | ✓ | Update profile fields |
| PUT  | `/api/auth/updatepassword` | ✓ | Change password |
| PUT  | `/api/auth/avatar` | ✓ | Upload avatar image |

### Pins
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/pins` | opt | List pins (filter, search, paginate) |
| GET  | `/api/pins/:id` | opt | Get single pin + increment views |
| POST | `/api/pins` | ✓ | Upload new pin (multipart) |
| PUT  | `/api/pins/:id` | ✓ | Update pin (owner only) |
| DELETE | `/api/pins/:id` | ✓ | Delete pin (owner only) |
| POST | `/api/pins/:id/save` | ✓ | Toggle save/unsave |
| POST | `/api/pins/:id/comments` | ✓ | Add comment |
| DELETE | `/api/pins/:id/comments/:commentId` | ✓ | Delete comment |
| GET  | `/api/pins/related/:id` | opt | Get related pins |

### Boards
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/boards` | opt | List boards |
| GET  | `/api/boards/:id` | opt | Get board + pins |
| POST | `/api/boards` | ✓ | Create board |
| PUT  | `/api/boards/:id` | ✓ | Update board |
| DELETE | `/api/boards/:id` | ✓ | Delete board |
| POST | `/api/boards/:id/pins` | ✓ | Add pin to board |
| DELETE | `/api/boards/:id/pins/:pinId` | ✓ | Remove pin from board |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/api/users` | — | Search users |
| GET  | `/api/users/:username` | opt | Get profile |
| GET  | `/api/users/:username/pins` | opt | Get user's pins |
| POST | `/api/users/:id/follow` | ✓ | Follow/unfollow user |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Zustand (state management)
- Tailwind CSS (styling)
- Axios (API client)
- react-hot-toast (notifications)
- react-infinite-scroll-component
- lucide-react (icons)

**Backend**
- Node.js + Express
- Mongoose (MongoDB ODM)
- JWT + bcryptjs (auth)
- Cloudinary + Multer (image uploads)
- Helmet + CORS + express-rate-limit (security)
- Morgan (request logging)

---

## 🚀 Production Deployment

### Backend (Railway / Render / Fly.io)
1. Set all environment variables
2. `npm start` (runs `node src/server.js`)
3. Set `NODE_ENV=production`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Update `vite.config.js` proxy → hardcode backend URL
3. `npm run build` → deploy `dist/`

---

## 🔐 Security Checklist
- [x] Passwords hashed with bcrypt (cost 12)
- [x] JWT tokens with expiry
- [x] Rate limiting on auth routes (20 req/15min)
- [x] Global rate limit (200 req/15min)
- [x] Helmet security headers
- [x] CORS configured to client origin
- [x] Owner-only pin/board mutations
- [x] Input validation via Mongoose
- [x] Error handler sanitises stack traces in production

---

## 📝 License
MIT
