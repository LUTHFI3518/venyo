# Fix "Error Loading Documents" in Firebase Console

## 🔍 Problem
You're seeing **"Error loading documents"** when trying to view the `users` collection in Firebase Console. This is because the Firestore security rules are blocking console access.

## ✅ Solution: Temporarily Use Test Mode Rules

For **development only**, use test mode rules so you can view and edit documents in the console:

### Step 1: Open Firestore Rules

1. In Firebase Console, go to **Firestore Database**
2. Click the **"Rules"** tab at the top
3. You'll see the current rules editor

### Step 2: Replace with Test Mode Rules

Copy and paste these **temporary test mode rules**:

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

### Step 3: Publish Rules

1. Click **"Publish"** button
2. Wait for confirmation
3. Go back to **"Data"** tab

### Step 4: Refresh & View Documents

1. Click on **"users"** collection again
2. You should now see all documents (or empty if no users exist yet)

## 🎯 Now Create Your Admin User

Once you can view documents:

### Option A: If You Already Have a User

1. **Click on your user document** (by email or UID)
2. Click **"Add field"** (if role doesn't exist)
3. Set:
   - **Field name**: `role`
   - **Field type**: `string`
   - **Field value**: `admin`
4. Click **"Update"**

### Option B: Create New Admin User Document

1. Click **"+ Add document"**
2. **Document ID**: Leave auto-generated OR use your Firebase Auth UID
3. **Fields**:
   - Click **"Add field"**
   - **Field 1**:
     - Name: `email`
     - Type: `string`
     - Value: `your@email.com`
   - **Field 2**:
     - Name: `role`
     - Type: `string`
     - Value: `admin`
   - **Field 3**:
     - Name: `createdAt`
     - Type: `timestamp` or `string`
     - Value: Current date/time
4. Click **"Save"**

## 🔒 After Creating Admin: Switch to Secure Rules

Once you have at least one admin user, switch back to secure rules:

### Step 1: Go Back to Rules Tab

1. Click **"Rules"** tab again

### Step 2: Use Secure Rules

Copy and paste these **secure production rules**:

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

### Step 3: Publish Secure Rules

1. Click **"Publish"**
2. Now you have secure rules but can still manage users via the admin dashboard

## 🔄 Alternative: Use Your App to Sign Up First

If you prefer not to use test mode:

1. **Sign up in your app**: Go to `http://localhost:3000/auth`
2. **This creates the user document automatically**
3. **Then use test mode rules temporarily** to edit the role
4. **Switch back to secure rules** after

## 📋 Quick Steps Summary

1. ✅ **Switch to test mode rules** (temporary)
2. ✅ **View/create user documents** in console
3. ✅ **Add `role: "admin"`** to your user
4. ✅ **Switch back to secure rules**
5. ✅ **Refresh your app** → Should see admin badge!

## ⚠️ Important Notes

- **Test mode rules** allow any authenticated user full access - **only use during development!**
- **Always switch back to secure rules** after setting up your first admin
- **Once you have an admin**, you can promote other users via the Super Admin Dashboard at `/superadmin/dashboard`

## 🐛 Still Getting Error?

1. ✅ Make sure rules are **published** (not just saved)
2. ✅ **Refresh** the Firebase Console page
3. ✅ Check you're in the **correct project** (`venyo-b1015`)
4. ✅ Make sure you're **signed in** to Firebase Console
5. ✅ Try **hard refresh** (Cmd+Shift+R or Ctrl+Shift+R)

---

**Quick Path**: Rules Tab → Test Mode Rules → Publish → Data Tab → View Documents → Edit User → Add `role: "admin"` → Switch Back to Secure Rules → Done!

**Created & Designed by Luthfi ✦**

