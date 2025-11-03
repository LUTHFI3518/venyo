# Venyo Setup Guide

## 🚀 Quick Start

1. **Install Dependencies**
```bash
cd venyo
npm install
```

2. **Configure Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Storage
   - Get your Firebase configuration

3. **Create `.env.local` file** (copy from `.env.example`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Sign in or create an account
   - Start using Venyo!

## 📝 Setting Up Admin Account

To create an admin account, you need to manually set the role in Firestore:

1. Sign up as a regular user
2. Go to Firebase Console > Firestore Database
3. Find your user document in the `users` collection
4. Edit the document and set the `role` field to `"admin"` or `"superadmin"`
5. Refresh the app - you'll now have admin access!

## 🎨 Features

✅ Dark/Light Theme Toggle  
✅ Google & Email Authentication  
✅ Venue Browsing & Booking  
✅ PDF Document Upload  
✅ Admin Approval System  
✅ Venue Management  
✅ Real-time Updates  
✅ Voice Notifications  
✅ Toast Notifications  
✅ Responsive Design  

## 🐛 Troubleshooting

### Build Errors

If you encounter SSR errors during build, try:
1. Make sure all environment variables are set correctly
2. Clear `.next` folder: `rm -rf .next`
3. Rebuild: `npm run build`

### Firebase Connection Issues

1. Check your Firebase configuration in `.env.local`
2. Verify Firebase services are enabled in Console
3. Check Firestore rules allow read/write for authenticated users

### Authentication Not Working

1. Ensure Firebase Authentication is enabled
2. Check that Email/Password and Google providers are enabled
3. Verify OAuth redirect URLs are configured correctly

## 📖 Documentation

See `README.md` for full documentation.

---

**Created & Designed by Luthfi ✦**

