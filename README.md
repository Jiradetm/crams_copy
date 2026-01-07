# CARMS - Corporate Asset & Resource Management System

## 🚀 Quick Start

### Prerequisites
- Node.js 24 LTS หรือใหม่กว่า
- npm 10+

### Installation

```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev
```

### Run Separately

```bash
# Backend only (port 3001)
npm run dev:backend

# Frontend only (port 3000)
npm run dev:frontend
```

## 📦 Project Structure

```
carms/
├── apps/
│   ├── frontend/          # Nuxt 4 Application
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Vue components
│   │   ├── layouts/       # Page layouts
│   │   └── stores/        # Pinia stores
│   │
│   └── backend/           # Express.js API
│       └── src/
│           ├── routes/    # API routes
│           ├── data/      # Mock data
│           └── middlewares/
│
└── packages/              # Shared packages
```

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carms.co.th | admin123 |
| HR | hr@carms.co.th | admin123 |
| User | user@carms.co.th | admin123 |

## 🎨 Features

### Modules

1. **Backoffice** - User & Role Management
   - Users, Employees, Departments, Roles

2. **Auto** - Vehicle Management
   - Car listing, Bookings, Maintenance alerts

3. **Meeting** - Meeting Room Reservation
   - Calendar view, Room management

4. **Leave** - Leave Management
   - Leave requests, Quota tracking, Approvals

### UI Features

- 🌙 Dark/Light mode
- 💎 Glassmorphism design
- 📱 Responsive layout
- ✨ Smooth animations
- 📊 Dashboard with stats

## 🔧 Tech Stack

- **Frontend:** Nuxt 4, Vue 3.5, Pinia 3
- **Backend:** Node.js 24 LTS, Express 5
- **Styling:** Custom CSS with CSS Variables

## 📝 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Backoffice
- `GET/POST /api/users` - User management
- `GET/POST /api/employees` - Employee management
- `GET/POST /api/departments` - Department management
- `GET/POST /api/roles` - Role management

### Auto
- `GET/POST /api/cars` - Car management
- `GET /api/cars/alerts` - Car alerts
- `GET/POST /api/car-bookings` - Booking management

### Meeting
- `GET/POST /api/meeting-rooms` - Room management
- `GET/POST /api/reservations` - Reservation management
- `GET /api/reservations/calendar` - Calendar view

### Leave
- `GET/POST /api/leave-types` - Leave types
- `GET/POST /api/leave-requests` - Leave requests
- `GET /api/leave-requests/my-quota` - User quota