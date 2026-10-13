# Bazario — multi-user marketplace (Khmer24-style)

A full-stack classifieds/marketplace app: users sign up, build a profile, post
items for sale with photos, and browse/search other people's listings —
similar to Khmer24.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Multer for image uploads
- **Frontend:** React + TypeScript, Vite, Tailwind CSS, React Router

## Features

- Register / log in (JWT-based, multi-user)
- Edit your own profile (name, phone, location, bio)
- Public seller profile page (shown to buyers, with their active listings)
- Post an item: title, description, price/currency, category, condition,
  location, up to 6 photos
- Browse all listings: keyword search, category filter, pagination
- Listing detail page: photo gallery, "show phone number" reveal, seller card
- Dashboard: your active/sold listings, total views, mark as sold, delete
- Admin dashboard for super admin promote by scripts/promoteToAdmin 
- Chat feature for end to end 
## Project structure

```
marketplace/
  backend/     Express API (auth, users, listings)
  frontend/    React app (Vite + Tailwind)
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run dev                # starts on http://localhost:5000
```

You need a MongoDB instance — either local (`mongodb://127.0.0.1:27017/marketplace`)
or a free cluster on MongoDB Atlas. Paste the connection string into `MONGO_URI`.
Set `JWT_SECRET` to any long random string.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev                 # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and start posting items.

## API overview

| Method | Route                | Auth | Description                          |
|--------|-----------------------|------|---------------------------------------|
| POST   | /api/auth/register    | No   | Create account                        |
| POST   | /api/auth/login       | No   | Log in, get JWT                       |
| GET    | /api/auth/me          | Yes  | Current user                          |
| GET    | /api/users/:id        | No   | Public seller profile + their listings|
| PUT    | /api/users/me         | Yes  | Update your profile                   |
| GET    | /api/listings         | No   | Browse (q, category, minPrice, maxPrice, location, page) |
| GET    | /api/listings/mine    | Yes  | Your own listings (any status)        |
| GET    | /api/listings/:id     | No   | Listing detail (increments views)     |
| POST   | /api/listings         | Yes  | Create listing (multipart, field `images`) |
| PUT    | /api/listings/:id     | Yes  | Update your own listing               |
| DELETE | /api/listings/:id     | Yes  | Delete your own listing               |

## Notes / next steps

This is a working core you can extend:
- Buyer↔seller in-app chat/messaging
- Payments / escrow
- Admin moderation panel
- Favorites / saved listings
- Email verification, password reset
- Image optimization + cloud storage (S3/Cloudinary) instead of local disk
 
 v1.0