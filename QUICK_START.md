# Quick Start Guide - Without Storage

If you can't enable Firebase Storage (requires Blaze plan), follow this guide to get Venyo running quickly.

## ✅ What Works Without Storage

- ✅ User authentication (Email/Password & Google)
- ✅ Venue browsing
- ✅ Booking requests
- ✅ Admin dashboard
- ✅ Approval system
- ✅ Venue management
- ❌ PDF uploads (optional feature)

## 🚀 Quick Setup Steps

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create project → Name it "venyo"
- Continue through setup

### 2. Enable Authentication
- Authentication → Sign-in method
- Enable **Email/Password**
- Enable **Google** (add support email)

### 3. Create Firestore Database
- Firestore Database → Create database
- Select **"Start in test mode"**
- Choose location → Enable

### 4. Skip Storage ⚠️
- **You can skip Storage for now!**
- Venyo will work without it
- PDF uploads will just be disabled

### 5. Get Firebase Config
- ⚙️ Project Settings → General
- Scroll to "Your apps" → Web app (or add one)
- Copy the config values

### 6. Set Up Environment Variables
Create `.env.local` in project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Note**: Even without Storage, include `STORAGE_BUCKET` in env (it won't be used)

### 7. Install & Run
```bash
cd venyo
npm install
npm run dev
```

### 8. Create Admin User
1. Sign up at `http://localhost:3000/auth`
2. Go to Firebase Console → Firestore
3. Find your user in `users` collection
4. Edit document → Add field:
   - Field: `role`
   - Value: `admin`
5. Save & refresh app

## 🎉 You're Done!

Your Venyo app is now running without Storage. All features work except PDF uploads.

### When Ready for Storage Later:

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Step 5 for upgrading to Blaze plan (it's free for most use cases).

---

**Tip**: The BookingModal already handles Storage gracefully - it will skip PDF uploads if Storage isn't available. No code changes needed!

