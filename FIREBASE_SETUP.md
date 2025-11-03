# Firebase Setup Guide for Venyo

This guide will walk you through creating and configuring a Firebase project for Venyo.

> 💡 **No Credit Card?** No problem! Use **ImgBB** (Step 5) for completely FREE PDF uploads - full setup guide included!

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `venyo` (or any name you prefer)
   - Click **"Continue"**

3. **Google Analytics (Optional)**
   - Choose whether to enable Google Analytics
   - For Venyo, you can disable it if you prefer
   - Click **"Create project"**

4. **Wait for Project Creation**
   - Firebase will set up your project (takes about 30 seconds)
   - Click **"Continue"** when done

## Step 2: Register a Web App

1. **Add a Web App**
   - In the project overview, click the **Web icon** (`</>`)
   - Or go to Project Settings > General > Your apps > Add app > Web

2. **Register App**
   - Enter app nickname: `Venyo Web` (or any name)
   - **Do NOT** check "Also set up Firebase Hosting" (unless you want it)
   - Click **"Register app"**

3. **Copy Configuration**
   - You'll see your Firebase config like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "venyo-project.firebaseapp.com",
     projectId: "venyo-project",
     storageBucket: "venyo-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
   - **Keep this tab open** - you'll need these values!

## Step 3: Enable Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click **"Get started"**

2. **Enable Sign-in Methods**
   - Click on **"Sign-in method"** tab
   - Enable **Email/Password**:
     - Click on "Email/Password"
     - Toggle **"Enable"** to ON
     - Click **"Save"**
   
   - Enable **Google**:
     - Click on "Google"
     - Toggle **"Enable"** to ON
     - Enter a support email (your email)
     - Click **"Save"**

3. **Authorized Domains** (for production)
   - Go to **"Settings"** > **"Authorized domains"**
   - Your localhost should already be there
   - Add your production domain when deploying

## Step 4: Create Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click **"Firestore Database"**
   - Click **"Create database"**

2. **Choose Security Rules**
   - Select **"Start in test mode"** (for development)
   - Click **"Next"**

3. **Choose Location**
   - Select a location closest to your users
   - Click **"Enable"**
   - Wait for database creation (takes about 30 seconds)

4. **Update Firestore Rules** (Important!)
   - Go to **"Rules"** tab
   - Replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection - users can read their own data, admins can read all
       match /users/{userId} {
         allow read: if request.auth != null && (request.auth.uid == userId || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin']);
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
   - Click **"Publish"**

## Step 5: Enable PDF Uploads (Optional)

> 💡 **Use ImgBB** - It's **100% FREE** with no credit card required! Perfect for PDF uploads.

### Use ImgBB (FREE PDF Hosting) ⭐ RECOMMENDED

**Perfect Solution**: If you don't want to upgrade Firebase, use **ImgBB** - it's **100% FREE**!

✅ **Completely FREE** - No credit card, no payment needed!  
✅ **Easy Setup** - Just get an API key (2 minutes)  
✅ **Supports PDFs** - Up to 32 MB per file  
✅ **Fast & Reliable** - Great uptime and performance  

#### Why ImgBB?

- ✅ **100% Free** - No credit card, no payment
- ✅ **No Account Needed** - Just get an API key
- ✅ **Supports PDFs** - Up to 32 MB per file
- ✅ **Easy Integration** - Simple REST API
- ✅ **Fast & Reliable** - Good uptime
- ✅ **No Limits** - For reasonable use

#### Step 1: Get ImgBB API Key

1. **Visit ImgBB API Page**
   - Go to [https://api.imgbb.com/](https://api.imgbb.com/)
   - Or visit [imgbb.com](https://imgbb.com/) and go to API section

2. **Get Free API Key**
   - Click **"Get API Key"** or **"Create API Key"**
   - Fill in basic info (email, name)
   - You'll get an API key like: `abc123def456ghi789`

3. **Copy Your API Key**
   - Save it somewhere safe
   - You'll need it for the next step

**Note**: ImgBB doesn't require credit card or payment - it's completely free!

#### Step 2: Add API Key to Venyo

1. **Open `.env.local` file**
   - In your Venyo project root
   - Create it if it doesn't exist

2. **Add ImgBB API Key**
   ```env
   NEXT_PUBLIC_IMGBB_API_KEY=your-api-key-here
   ```

3. **Example `.env.local`** (with Firebase + ImgBB):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=venyo-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=venyo-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=venyo-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   
   # ImgBB API Key for free PDF uploads
   NEXT_PUBLIC_IMGBB_API_KEY=abc123def456ghi789
   ```

4. **Restart Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

#### Step 3: Use ImgBB Version

Replace the BookingModal with the ImgBB version:

```bash
cd venyo

# Backup current version (optional)
cp src/components/BookingModal.tsx src/components/BookingModal.tsx.backup

# Use ImgBB version
cp src/components/BookingModal-ImgBB.tsx src/components/BookingModal.tsx
```

#### ✅ Done!

Now PDF uploads will work using ImgBB - completely free!

**Test It**:
1. Start your app: `npm run dev`
2. Go to a venue booking page
3. Click "Request Booking"
4. Try uploading a PDF
5. It should upload successfully!

#### 🔍 How It Works

1. **User selects PDF** → File is selected
2. **On submit** → PDF is uploaded to ImgBB
3. **ImgBB returns URL** → PDF URL is saved in Firestore
4. **Admin can view** → Click PDF link to view/download

#### 📊 File Size Limits

- **Max file size**: 32 MB per upload
- **File types**: PDF, images, etc.
- **Storage**: Unlimited (reasonable use)
- **Speed**: Fast uploads

#### 🔒 Security Notes

1. **API Key Exposure**
   - `NEXT_PUBLIC_` prefix makes it visible in browser
   - This is OK for ImgBB (it's meant to be public)
   - ImgBB has rate limiting per API key

2. **Best Practices**
   - Don't share your API key publicly
   - Use different keys for dev/prod
   - Monitor usage in ImgBB dashboard

#### 🆚 ImgBB vs Firebase Storage

| Feature | ImgBB | Firebase Storage |
|---------|-------|-----------------|
| **Cost** | ✅ Free | ❌ Requires Blaze plan |
| **Setup** | ✅ Easy (just API key) | ❌ Complex |
| **File Size** | 32 MB | Custom |
| **Credit Card** | ❌ Not needed | ✅ Required |
| **API** | ✅ Simple REST | ✅ Firebase SDK |

#### 🐛 Troubleshooting

**Upload Fails**:
- ✅ Check API key is correct in `.env.local`
- ✅ Restart dev server after adding API key
- ✅ Check file size (max 32 MB)
- ✅ Check browser console for errors

**API Key Not Working**:
- ✅ Verify key is correct at [api.imgbb.com](https://api.imgbb.com/)
- ✅ Make sure it's in `.env.local` with `NEXT_PUBLIC_` prefix
- ✅ Check no extra spaces or quotes

**PDF Not Showing**:
- ✅ Check Firestore has `pdf_url` field
- ✅ Verify URL is valid (opens in browser)
- ✅ Check admin approval page

#### 💡 Alternative: Hide PDF Uploads Completely

If you don't want any PDF upload feature at all (even with ImgBB), you can hide it completely:

**Quick Method: Use No-Storage Version**
```bash
cd venyo
# Backup current version (optional)
cp src/components/BookingModal.tsx src/components/BookingModal.tsx.backup

# Use the no-storage version (removes PDF upload completely)
cp src/components/BookingModal-NoStorage.tsx src/components/BookingModal.tsx
```

**Result**: PDF upload section is completely removed - bookings work perfectly without it!

#### 📚 Additional Resources

- **ImgBB API Docs**: [https://api.imgbb.com/](https://api.imgbb.com/)
- **ImgBB Website**: [https://imgbb.com/](https://imgbb.com/)
- **API Rate Limits**: Check ImgBB dashboard

## Step 6: Configure Environment Variables

1. **Create `.env.local` file**
   - In your Venyo project root, create `.env.local`
   - Copy from `.env.example`: `cp .env.example .env.local`
   - Or create it manually using the template below

2. **Add Your Firebase Config**
   - Open the Firebase config you copied earlier
   - Add to `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=venyo-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=venyo-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=venyo-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   
   # Optional: ImgBB API key for free PDF uploads (if not using Firebase Storage)
   # Get free API key from https://api.imgbb.com/
   # NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key
   ```

3. **Important Notes**
   - Replace the values with YOUR actual Firebase config values
   - Do NOT commit `.env.local` to git (it's already in `.gitignore`)
   - Keep these values secret!

## Step 7: Test Your Setup

1. **Start Development Server**
   ```bash
   cd venyo
   npm run dev
   ```

2. **Test Authentication**
   - Go to `http://localhost:3000/auth`
   - Try signing up with email/password
   - Check Firebase Console > Authentication to see the new user

3. **Create Admin User**
   - After signing up, go to Firebase Console > Firestore Database
   - Find your user document in the `users` collection
   - Edit the document and add field:
     - Field: `role`
     - Type: `string`
     - Value: `admin` or `superadmin`
   - Save
   - Refresh your app - you should now have admin access!

## Step 8: Set Up First Venue (Optional)

1. **Via Admin Dashboard**
   - Sign in as admin
   - Go to `/admin/venues`
   - Click "Add Venue"
   - Fill in details and save

2. **Or via Firebase Console**
   - Go to Firestore Database
   - Click "Start collection"
   - Collection ID: `venues`
   - Add document with fields:
     - `name` (string): "Seminar Hall"
     - `capacity` (number): 120
     - `status` (string): "available"
     - `description` (string): "Main seminar hall"
     - `availability` (map): {}

## Troubleshooting

### Authentication Not Working
- ✅ Check that Email/Password and Google are enabled in Authentication settings
- ✅ Verify your API key is correct in `.env.local`
- ✅ Check browser console for errors

### Firestore Permission Denied
- ✅ Verify Firestore rules are published (Rules tab)
- ✅ Check that user is authenticated
- ✅ Verify user role field exists in Firestore

### PDF Upload Fails
- ✅ **Using ImgBB?** Check `NEXT_PUBLIC_IMGBB_API_KEY` is set correctly in `.env.local`
- ✅ **Using ImgBB?** Verify you're using `BookingModal-ImgBB.tsx` version
- ✅ **Using ImgBB?** Restart dev server after adding API key
- ✅ **Using ImgBB?** Check file size (max 32 MB) - see Step 5 for troubleshooting
- ✅ **Using ImgBB?** Verify API key is correct at [api.imgbb.com](https://api.imgbb.com/)

### Build Errors
- ✅ Ensure all environment variables are set
- ✅ Restart dev server after changing `.env.local`
- ✅ Clear `.next` folder: `rm -rf .next`

## Production Deployment

When deploying to production:

1. **Update Firestore Rules**
   - Remove test mode rules
   - Use production-ready security rules (see above)

2. **Update Authorized Domains**
   - Go to Authentication > Settings
   - Add your production domain

3. **Set Environment Variables**
   - Add Firebase config to your hosting platform (Vercel, Netlify, etc.)
   - Use the same variable names as in `.env.local`
   - If using ImgBB, also add `NEXT_PUBLIC_IMGBB_API_KEY` to your hosting platform

## Quick Reference

**Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)

**Firestore Rules Location**: Firestore Database > Rules tab

**Storage Rules Location**: Storage > Rules tab

**Authentication Settings**: Authentication > Sign-in method tab

**Project Settings**: ⚙️ Project Settings > General tab

**Free PDF Uploads**: See Step 5 for ImgBB setup (100% free, no credit card)

**Note**: Firebase Storage is optional - Venyo works perfectly without it! Use ImgBB for free PDF uploads.

---

**Need Help?** Check the [README.md](./README.md) or create an issue in the repository.

**Created & Designed by Luthfi ✦**

