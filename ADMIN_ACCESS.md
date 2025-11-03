# Admin Panel Access Guide

## 🔐 Admin Panel Routes

The Venyo admin panel has **3 main sections**:

### 1. **Admin Dashboard** (`/admin/dashboard`)
- **URL**: `http://localhost:3000/admin/dashboard`
- **Features**:
  - View statistics (Total Venues, Pending Approvals, Upcoming Bookings)
  - Venue utilization charts
  - Quick links to other admin sections

### 2. **Booking Approvals** (`/admin/approvals`)
- **URL**: `http://localhost:3000/admin/approvals`
- **Features**:
  - Review and approve/reject booking requests
  - View PDF documents uploaded with bookings
  - Filter by status (all, pending, approved, rejected)
  - See booking details (venue, user, date, time)

### 3. **Venue Management** (`/admin/venues`)
- **URL**: `http://localhost:3000/admin/venues`
- **Features**:
  - Add new venues
  - Edit existing venues
  - Delete venues
  - View venue details and status

### 4. **Super Admin Dashboard** (`/superadmin/dashboard`)
- **URL**: `http://localhost:3000/superadmin/dashboard`
- **Features** (for superadmin only):
  - User management
  - Assign roles (user, admin, superadmin)
  - Manage all users

## 🚀 How to Access Admin Panel

### Step 1: Sign Up or Sign In

1. **Go to**: `http://localhost:3000/auth`
2. **Sign up** with Email/Password or Google
3. **After signing in**, you'll be redirected to `/user/dashboard` (regular user)

### Step 2: Set Your Role to Admin

To access admin panels, you need to set your role in Firestore:

1. **Go to Firebase Console**:
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project (`venyo-b1015`)

2. **Open Firestore Database**:
   - Click "Firestore Database" in the left sidebar
   - Find the `users` collection

3. **Edit Your User Document**:
   - Find your user document (by your email or UID)
   - Click on the document to edit
   - Click "Add field" button
   - **Field name**: `role`
   - **Field type**: Select `string`
   - **Field value**: Enter `admin` or `superadmin`
   - Click "Update" to save

4. **Refresh Your App**:
   - Go back to `http://localhost:3000`
   - Refresh the page (F5 or Cmd+R)
   - You should now see "Dashboard" in the navbar
   - Click "Dashboard" to access `/admin/dashboard`

### Step 3: Access Admin Sections

After setting your role, you can access admin panels in multiple ways:

#### Method 1: Via Navbar
- **Click "Dashboard"** in the top navbar
- Automatically redirects to `/admin/dashboard` (if you're admin)

#### Method 2: Direct URL
- Type the URL directly in your browser:
  - `http://localhost:3000/admin/dashboard`
  - `http://localhost:3000/admin/approvals`
  - `http://localhost:3000/admin/venues`

#### Method 3: From Admin Dashboard Cards
- Go to `/admin/dashboard`
- Click on any stat card (Total Venues, Pending Approvals, etc.)
- Automatically navigates to the relevant section

## 🔒 Access Protection

**Important**: If you're NOT an admin:
- Accessing `/admin/dashboard` will redirect you to `/auth`
- Accessing `/admin/approvals` will redirect you to `/auth`
- Accessing `/admin/venues` will redirect you to `/auth`

**You must have `admin` or `superadmin` role** in Firestore to access these pages.

## ✅ Quick Checklist

- [ ] Signed up/signed in at `/auth`
- [ ] Went to Firebase Console > Firestore
- [ ] Found `users` collection
- [ ] Edited your user document
- [ ] Added `role` field with value `admin` or `superadmin`
- [ ] Refreshed the app
- [ ] Clicked "Dashboard" in navbar or went to `/admin/dashboard`

## 🎯 After Setting Up Admin

Once you're an admin, you can:

1. **Add Your First Venue**:
   - Go to `/admin/venues`
   - Click "Add Venue"
   - Fill in: Name, Capacity, Description, Status
   - Save

2. **Review Bookings**:
   - Go to `/admin/approvals`
   - See all booking requests
   - Click "Approve" or "Reject" for each booking

3. **View Statistics**:
   - Go to `/admin/dashboard`
   - See venue utilization charts
   - Monitor booking trends

## 📍 Navigation Flow

```
User Sign In
    ↓
Check User Role (from Firestore)
    ↓
If admin/superadmin → Redirect to /admin/dashboard
If regular user → Redirect to /user/dashboard
    ↓
Admin Dashboard
    ├── Click "Total Venues" → /admin/venues
    ├── Click "Pending Approvals" → /admin/approvals
    └── Use Navbar "Dashboard" link → /admin/dashboard
```

## 🔧 Troubleshooting

**Can't access admin panel?**
- ✅ Check your role in Firestore (`users` collection)
- ✅ Make sure role field value is exactly `admin` or `superadmin` (lowercase)
- ✅ Refresh the browser after updating Firestore
- ✅ Sign out and sign back in

**Redirected to `/auth`?**
- ✅ Your role might not be set correctly
- ✅ Check browser console for errors
- ✅ Verify Firestore rules allow reading user documents

---

**Need help?** Check the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase setup instructions.

**Created & Designed by Luthfi ✦**

