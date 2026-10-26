# MITS Campus Issue Resolution System

A fullstack campus grievance and issue tracking platform built for **Madhav Institute of Technology & Science (MITS)** using a single-folder **Next.js App Router** architecture with MongoDB and Mongoose.

---

## 🌟 Highlights & Architecture

- **Single-Folder Fullstack Next.js App Router**: No separate `backend` or `frontend` folders. Both frontend user interfaces and backend API routes exist seamlessly in a unified project structure.
- **Next.js Route Handlers (`src/app/api/...`)**:
  - `/api/auth/register` & `/api/auth/login` & `/api/auth/logout` & `/api/auth/me`
  - `/api/issues` (List with search, category, status, priority filters, and submit)
  - `/api/issues/[id]` (Details, status update, priority change, official remarks, deletion)
  - `/api/issues/[id]/vote` (Upvoting and community endorsement)
  - `/api/issues/[id]/comments` (Discussion thread and official replies)
  - `/api/stats` (Metrics and resolution rates)
  - `/api/seed` (Instant realistic demo data population)
  - `/api/health` (MongoDB connection check)
- **Database & Auth**:
  - MongoDB Atlas via cached singleton Mongoose connection (`src/lib/db.ts`)
  - JWT authentication stored in secure HTTP-only cookies (`src/lib/auth.ts`)
- **Modern UI**:
  - Tailwind CSS v4 styling with responsive cards, status tags, and priority badges
  - Real-time endorsement counters
  - Instant demo account selector (Student, Staff, Administrator)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Check or customize `.env.local`:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts

Click the **Demo Accounts** dropdown on the navigation bar to sign in instantly with one click:

| Role | Email | Password |
|---|---|---|
| **Student** | `student@mits.edu` | `student123` |
| **Administrator** | `admin@mits.edu` | `admin123` |
| **Staff (Maintenance)** | `maintenance@mits.edu` | `staff123` |
