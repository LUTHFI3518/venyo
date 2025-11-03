# Firestore Security Rules

## Current Error

```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

This means your Firestore security rules need to be updated.

## 🔧 Quick Fix: Update Firestore Rules

### Step 1: Go to Firebase Console

1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Select your project: `venyo-b1015`
3. Click **"Firestore Database"** in the left sidebar

### Step 2: Open Rules Tab

1. Click on the **"Rules"** tab at the top
2. You'll see the current rules (probably in "test mode")

### Step 3: Replace with These Rules

Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin']
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Venues collection - everyone can read, only admins can write
    match /venues/{venueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Bookings collection - users can create and read their own, admins can read/write all
    match /bookings/{bookingId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.user_id ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin']
      );
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
  }
}
```

### Step 4: Publish Rules

1. Click **"Publish"** button
2. Wait for confirmation
3. Rules are now active!

## 🧪 Test Mode Rules (Temporary - Less Secure)

If the above rules don't work immediately, you can use test mode temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Warning**: Test mode allows any authenticated user to read/write everything. Only use for development!

## ✅ Verify Rules Are Working

After updating rules:

1. **Refresh your app** (`http://localhost:3000`)
2. **Sign in** again
3. **Check browser console** - the error should be gone
4. **Try accessing venues or bookings** - should work now

## 🔒 Rule Breakdown

### Users Collection
- ✅ Users can read their own data
- ✅ Admins can read all users
- ✅ Users can write their own data only

### Venues Collection
- ✅ All authenticated users can read venues
- ✅ Only admins can create/edit/delete venues

### Bookings Collection
- ✅ Users can create bookings (for themselves)
- ✅ Users can read their own bookings
- ✅ Admins can read/write all bookings

## 🐛 Common Issues

### "get() function calls are not supported"
- **Solution**: Make sure the user document exists before checking role
- The rules above handle this correctly

### "Permission denied" even after updating rules
- ✅ Verify rules are published (check Rules tab)
- ✅ Make sure you're signed in
- ✅ Check browser console for specific error
- ✅ Try signing out and signing back in

### Rules not saving
- ✅ Check you have edit permissions on the Firebase project
- ✅ Make sure you're in the correct project
- ✅ Try refreshing the Firebase Console page

---

**Need Help?** These rules are production-ready and secure. If issues persist, check the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide.

**Created & Designed by Luthfi ✦**

