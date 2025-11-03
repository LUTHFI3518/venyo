# Venyo - Smart Venue Management Platform

Venyo is a futuristic, minimal, and glassy platform for managing college venues, auditoriums, and labs. Built with Next.js, TypeScript, TailwindCSS, and Framer Motion.

## ✨ Features

- 🌓 **Dark & Light Theme** - Toggle between light and dark modes with glassmorphism design
- 🔐 **Authentication** - Google OAuth and Email/Password authentication via Firebase
- 📅 **Venue Dashboard** - Browse and view venue availability with real-time updates
- 📝 **Booking System** - Request bookings with PDF document uploads
- ✅ **Admin Approval** - Admin dashboard for approving/rejecting booking requests
- 🏢 **Venue Management** - Add, edit, and delete venues (Admin only)
- 🔔 **Notifications** - Push notifications and voice feedback for booking updates
- 📱 **Responsive Design** - Fully responsive for mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Storage enabled

### Installation

1. Clone the repository:
   ```bash
   cd venyo
```

2. Install dependencies:
```bash
   npm install
   ```

3. Set up Firebase:

   📖 **Detailed Guide**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for step-by-step instructions
   
   Quick steps:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Get your Firebase configuration

4. Create a `.env.local` file in the root directory:
```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
venyo/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentication page
│   │   ├── user/
│   │   │   └── dashboard/     # User dashboard
│   │   ├── admin/
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── approvals/     # Booking approvals
│   │   │   └── venues/        # Venue management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/            # React components
│   │   ├── BookingModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Settings.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── VenueCard.tsx
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                  # Custom hooks
│   │   └── useNotification.tsx
│   └── lib/
│       └── firebase.ts        # Firebase configuration
└── public/                     # Static assets
```

## 🎨 Design System

### Light Mode
- Background: Translucent white glass (`rgba(255,255,255,0.65)`)
- Text: `#1e293b`
- Accent: Sky blue (`#38bdf8`)
- Shadow: Subtle cyan glow

### Dark Mode
- Background: Gradient (`#0b1221` → `#151c2c`)
- Card: Translucent black glass (`rgba(25,30,45,0.5)`)
- Text: `#f8fafc`
- Accent: Neon blue glow (`#3b82f6`)

## 🔧 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Charts**: Recharts
- **Icons**: React Icons

## 📝 User Roles

- **User**: Can view venues and request bookings
- **Admin**: Can approve bookings and manage venues
- **Super Admin**: Full access (same as admin currently)

## 🔔 Notifications

- **Push Notifications**: Browser notifications for booking status updates (requires FCM setup)
- **Voice Feedback**: Text-to-speech notifications (can be toggled in Settings)

## 🎯 Usage

### For Users
1. Sign in or create an account
2. Browse available venues on the dashboard
3. Click "Request Booking" on a venue card
4. Fill in the booking details and upload a PDF (optional)
5. Submit and wait for admin approval

### For Admins
1. Sign in with an admin account
2. View dashboard statistics
3. Go to "Approvals" to approve/reject bookings
4. Go to "Venues" to manage venue information

## 🛠️ Development

### Build for production:
```bash
npm run build
npm start
```

### Run linter:
```bash
npm run lint
```

## 📄 License

This project is created and designed by Luthfi ✦.

## 🙏 Acknowledgments

- Design inspired by makemypass.com
- Built with modern web technologies
- Glassmorphism UI design patterns

---

**Created & Designed by Luthfi ✦**
