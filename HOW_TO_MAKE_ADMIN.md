# How to Change User to Admin - Quick Guide

## 🎯 Method 1: Firebase Console (Easiest)

### Step-by-Step Instructions

1. **Sign Up First** (if you haven't):
   - Go to `http://localhost:3000/auth`
   - Sign up with Email/Password or Google
   - Note your email address

2. **Go to Firebase Console**:
   - Visit: [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account
   - Select your project: **`venyo-b1015`**

3. **Open Firestore Database**:
   - Click **"Firestore Database"** in the left sidebar
   - Wait for it to load

4. **Find Users Collection**:
   - Look for **`users`** collection in the left panel
   - Click on it to expand
   - You'll see all user documents

5. **Find Your User**:
   - Look for a document with your email or UID
   - Click on the document to open it

6. **Add/Edit Role Field**:
   - Click **"Add field"** button (if role doesn't exist)
   - OR click on the existing `role` field to edit it
   
   - **Field name**: `role`
   - **Field type**: Select **`string`** from dropdown
   - **Field value**: Type exactly `admin` (lowercase, no quotes)
   
   - Click **"Update"** or **"Save"** button

7. **Verify the Change**:
   - The document should now show:
     ```
     email: "your@email.com"
     role: "admin"
     createdAt: "..."
     ```

8. **Refresh Your App**:
   - Go back to `http://localhost:3000`
   - Refresh the page (F5 or Cmd+R)
   - You should now see **"Admin"** badge in the navbar
   - You'll be redirected to `/admin/dashboard` automatically

## 🎯 Method 2: Super Admin Dashboard (After Making First Admin)

Once you have one admin, you can promote other users via the Super Admin Dashboard:

1. **Sign in as Admin or Super Admin**
2. **Go to**: `http://localhost:3000/superadmin/dashboard`
3. **Find the user** in the User Management table
4. **Select role** from the dropdown: `admin` or `superadmin`
5. **Save** - The role updates automatically!

## 📋 Quick Checklist

- [ ] User has signed up (exists in Firestore `users` collection)
- [ ] Found user document in Firebase Console
- [ ] Added/edited `role` field
- [ ] Set value to exactly `admin` (lowercase)
- [ ] Saved the changes
- [ ] Refreshed the app
- [ ] See "Admin" badge in navbar

## 🔍 Finding Your User Document

**By Email**:
- Look for documents where `email` field matches your email

**By UID**:
- The document ID is usually the Firebase Auth UID
- You can find your UID in:
  - Browser console: Check `auth.currentUser.uid`
  - Firebase Console > Authentication > Users tab

## ⚠️ Important Notes

1. **Case Sensitive**: Role must be exactly `admin` (not `Admin` or `ADMIN`)
2. **Field Type**: Must be `string` type, not number
3. **Refresh Required**: Always refresh the app after changing role in Firestore
4. **Real-time**: Changes should reflect immediately after refresh

## 🎯 Role Values

- `user` - Regular user (default)
- `admin` - Admin access (can manage venues & approve bookings)
- `superadmin` - Super Admin (can manage users & everything else)

## ✅ Verify It Worked

After making changes:
1. Check navbar - should show "Admin" or "Super Admin" badge
2. Check URL - should be `/admin/dashboard` (auto-redirect)
3. Check Firestore - verify `role: "admin"` is saved

## 🚨 Troubleshooting

**Role not updating?**
- ✅ Make sure you saved the changes in Firestore
- ✅ Refresh the browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
- ✅ Sign out and sign back in
- ✅ Check Firestore rules allow reading user documents

**Can't find user document?**
- ✅ User must sign up first (creates document automatically)
- ✅ Check Authentication > Users tab in Firebase Console for UID
- ✅ Look in `users` collection (not `users` subcollection)

**Still seeing "User" badge?**
- ✅ Double-check the field name is exactly `role` (lowercase)
- ✅ Check the value is exactly `admin` (lowercase, no quotes)
- ✅ Verify the document was saved (refresh Firestore view)

---

**Quick Path**: Firebase Console → Firestore Database → `users` collection → Your user document → Add `role: "admin"` → Save → Refresh app

**Created & Designed by Luthfi ✦**

