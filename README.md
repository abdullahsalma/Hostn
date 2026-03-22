# 🏡 Hostn — Vacation Rental Marketplace

A full-stack vacation rental marketplace inspired by [Gathern](https://gathern.co/), built with **Next.js**, **Node.js/Express**, and **MongoDB**. Users can discover, book, and host chalets, villas, apartments, farms, and more.

---

## ✨ Features

- **Browse & Search** — Filter by city, property type, dates, guests, and price range
- **Property Listings** — Detailed pages with image galleries, amenities, rules, and reviews
- **Booking System** — Full booking flow with pricing breakdown, availability checks, and confirmation
- **Authentication** — JWT-based auth with separate Guest/Host/Admin roles
- **Reviews & Ratings** — Leave and manage reviews with host response support
- **User Dashboard** — Manage bookings, saved properties, profile, and hosted listings
- **Wishlist** — Save favorite properties
- **Responsive UI** — Mobile-first design using Tailwind CSS

---

## 🗂 Project Structure

```
hostn/
├── backend/           # Express API
│   ├── src/
│   │   ├── config/    # Database connection
│   │   ├── middleware/ # Auth & error handling
│   │   ├── models/    # Mongoose schemas (User, Property, Booking, Review)
│   │   ├── routes/    # API route definitions
│   │   ├── controllers/ # Business logic
│   │   └── server.js  # App entry point
│   ├── scripts/
│   │   └── seed.js    # Database seeder
│   ├── .env.example
│   └── package.json
│
└── frontend/          # Next.js 14 App Router
    ├── src/
    │   ├── app/       # Pages (home, listings, booking, auth, dashboard)
    │   ├── components/ # Reusable UI components
    │   ├── context/   # Auth context (React Context API)
    │   ├── lib/       # API client (Axios) + utilities
    │   └── types/     # TypeScript types
    ├── .env.local.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hostn.git
cd hostn
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hostn
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Start the API server:**

```bash
npm run dev         # Development (with nodemon)
npm start           # Production
```

**Seed the database:**

```bash
npm run seed
```

This creates test accounts, 12 sample properties, bookings, and reviews.

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Hostn
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Start the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Test Accounts (after seeding)

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | tariq@hostn.com        | Password123 |
| Host  | samir@hostn.com        | Password123 |
| Host  | fatima@hostn.com       | Password123 |
| Guest | omar@hostn.com         | Password123 |
| Guest | layla@hostn.com        | Password123 |

---

## 📡 API Reference

### Auth
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| POST   | /api/auth/register              | Register              |
| POST   | /api/auth/login                 | Login                 |
| GET    | /api/auth/me                    | Get current user      |
| PUT    | /api/auth/profile               | Update profile        |
| PUT    | /api/auth/change-password       | Change password       |
| POST   | /api/auth/wishlist/:propertyId  | Toggle wishlist       |

### Properties
| Method | Endpoint                             | Description             |
|--------|--------------------------------------|-------------------------|
| GET    | /api/properties                      | List/search properties  |
| GET    | /api/properties/:id                  | Get one property        |
| POST   | /api/properties                      | Create property (host)  |
| PUT    | /api/properties/:id                  | Update property         |
| DELETE | /api/properties/:id                  | Soft-delete property    |
| GET    | /api/properties/my-properties        | Host's own properties   |
| GET    | /api/properties/:id/availability     | Check availability      |
| GET    | /api/properties/cities               | Get distinct cities     |

**Query parameters for GET /api/properties:**
- `city`, `type`, `guests`, `minPrice`, `maxPrice`
- `checkIn`, `checkOut` (availability filter)
- `featured=true`, `search`, `page`, `limit`, `sort`

### Bookings
| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| POST   | /api/bookings                 | Create booking         |
| GET    | /api/bookings/my-bookings     | Guest's bookings       |
| GET    | /api/bookings/host-bookings   | Host's received bookings |
| GET    | /api/bookings/:id             | Single booking         |
| PUT    | /api/bookings/:id/status      | Confirm/reject (host)  |
| PUT    | /api/bookings/:id/cancel      | Cancel (guest)         |

### Reviews
| Method | Endpoint                          | Description         |
|--------|-----------------------------------|---------------------|
| GET    | /api/reviews/property/:propertyId | Property reviews    |
| POST   | /api/reviews                      | Create review       |
| PUT    | /api/reviews/:id                  | Update review       |
| DELETE | /api/reviews/:id                  | Delete review       |
| POST   | /api/reviews/:id/respond          | Host response       |

---

## 🎨 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js 14 (App Router) |
| Styling  | Tailwind CSS            |
| State    | React Context API       |
| HTTP     | Axios                   |
| Backend  | Node.js + Express       |
| Database | MongoDB + Mongoose      |
| Auth     | JWT (jsonwebtoken)      |
| Password | bcryptjs                |

---

## 🗺 Pages

| Route                | Description                     |
|----------------------|---------------------------------|
| `/`                  | Home – hero search, featured listings, city browse |
| `/listings`          | Search results with filters     |
| `/listings/[id]`     | Property detail + booking widget |
| `/booking/[id]`      | Booking confirmation flow       |
| `/auth/login`        | Sign in                         |
| `/auth/register`     | Create account (guest or host)  |
| `/dashboard`         | User dashboard (bookings, profile, properties) |

---

## 🔮 Future Enhancements

- Payment gateway integration (Stripe / PayTabs)
- Real-time chat between guest and host
- Email notifications
- Map view for listings
- Multi-language support (Arabic/English)
- Mobile app (React Native)
- Admin panel

---

## 📄 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ by the Hostn team.
