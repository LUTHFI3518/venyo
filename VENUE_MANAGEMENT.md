# Venue Management Guide

## 🎯 Overview

Admins can **add, edit, and remove venues** from the Venue Management page. This guide shows you how to use all venue management features.

## 🚀 Access Venue Management

### Step 1: Sign in as Admin

1. Go to `http://localhost:3000/auth`
2. Sign in with your admin account
3. You'll be redirected to `/admin/dashboard`

### Step 2: Navigate to Venue Management

**Option A**: Direct URL
- Go to: `http://localhost:3000/admin/venues`

**Option B**: From Admin Dashboard
- Click on "Venue Management" card
- Or click "Venues" in the navigation menu

## ➕ Add New Venue

### Step-by-Step:

1. **Click "Add Venue" Button**
   - Located in the top-right corner of the page

2. **Fill in Venue Details**:
   - **Venue Name** (required): Enter the name of the venue
     - Example: "Main Auditorium", "Lab 101", "Conference Room A"
   
   - **Capacity** (required): Enter the maximum number of people
     - Must be a positive number
     - Example: `50`, `100`, `200`
   
   - **Description** (optional): Add details about the venue
     - Example: "Large auditorium with projectors and sound system"
   
   - **Status** (required): Select from dropdown
     - `Available` - Venue is ready for bookings
     - `Booked` - Currently booked (usually auto-set)
     - `Maintenance` - Under maintenance, not available

3. **Click "Add" Button**
   - Venue is saved to Firestore
   - Success notification appears
   - Modal closes automatically

## ✏️ Edit Existing Venue

### Step-by-Step:

1. **Find the Venue**
   - Browse the venue cards on the page
   - Each card shows:
     - Venue name
     - Capacity (with icon)
     - Status badge (Available/Booked/Maintenance)
     - Description (if provided)

2. **Click "Edit" Button**
   - Located on the venue card
   - Opens the edit modal with current venue data

3. **Modify Venue Details**:
   - Update any field (name, capacity, description, status)
   - All fields are editable

4. **Click "Update" Button**
   - Changes are saved to Firestore
   - Success notification appears
   - Modal closes automatically
   - Venue card updates in real-time

## 🗑️ Delete Venue

### Step-by-Step:

1. **Find the Venue**
   - Browse the venue cards

2. **Click the Trash Icon** (🗑️)
   - Located on the venue card
   - Red button with trash icon

3. **Confirm Deletion**:
   - Browser confirmation dialog appears
   - Click "OK" to confirm
   - Click "Cancel" to abort

4. **Venue Deleted**:
   - Venue is removed from Firestore
   - Success notification appears
   - Venue card disappears from the list
   - ⚠️ **Warning**: This action cannot be undone!

## 📊 Venue Status Types

### Available (Green) ✅
- Venue is ready for bookings
- Users can book this venue
- Default status for new venues

### Booked (Red) ❌
- Venue has active bookings
- Usually set automatically by the system
- Can be manually set for temporary unavailability

### Maintenance (Yellow) ⚠️
- Venue is under maintenance
- Not available for new bookings
- Useful for scheduled maintenance periods

## 🎨 Features

### Real-time Updates
- Venue list updates automatically when:
  - New venue is added
  - Venue is edited
  - Venue is deleted
- No page refresh needed!

### Glassmorphism UI
- Beautiful glassy design
- Smooth animations
- Theme-aware (light/dark mode)

### Responsive Design
- Works on mobile, tablet, and desktop
- Grid layout adapts to screen size
- Touch-friendly buttons

## 📋 Venue Data Structure

Each venue in Firestore has:

```typescript
{
  name: string,              // Venue name
  capacity: number,          // Maximum capacity
  description?: string,      // Optional description
  status: 'available' | 'booked' | 'maintenance',
  availability: {           // Time slots by date
    [date: string]: string[]
  },
  created_at: string,       // ISO timestamp
  updated_at?: string        // ISO timestamp (on edit)
}
```

## 🔒 Permissions

- **Only admins and superadmins** can access this page
- Regular users are redirected to `/auth` if they try to access
- Firestore security rules enforce admin-only write access

## 🐛 Troubleshooting

### "Can't access venue management page"
- ✅ Make sure you're signed in as admin
- ✅ Check your role in Firestore (`role: "admin"` or `role: "superadmin"`)
- ✅ Refresh the page after changing role

### "Failed to save venue"
- ✅ Check Firestore security rules allow admin writes
- ✅ Check browser console for specific error
- ✅ Make sure you're connected to the internet
- ✅ Verify Firebase configuration in `.env.local`

### "Venue not appearing after adding"
- ✅ Check Firestore Console to see if document was created
- ✅ Refresh the page (real-time updates should work automatically)
- ✅ Check browser console for errors

### "Can't edit venue"
- ✅ Make sure you clicked the "Edit" button (not just the card)
- ✅ Check if modal opened correctly
- ✅ Verify all required fields are filled

### "Delete not working"
- ✅ Check browser console for errors
- ✅ Make sure you confirmed the deletion dialog
- ✅ Verify Firestore rules allow admin deletes

## 💡 Best Practices

1. **Use Descriptive Names**
   - Be specific: "Main Auditorium - Building A" vs "Room 1"
   - Include building or floor if multiple locations

2. **Set Accurate Capacity**
   - Include standing room if applicable
   - Consider COVID-19 restrictions if needed

3. **Add Descriptions**
   - List available equipment (projectors, microphones, etc.)
   - Note special features or restrictions

4. **Use Status Wisely**
   - Keep status updated for accurate availability
   - Set to "Maintenance" during scheduled maintenance
   - Mark "Booked" only when truly unavailable

5. **Regular Updates**
   - Update venue info when equipment changes
   - Remove venues that are no longer in use

## 🎯 Quick Reference

| Action | Steps |
|--------|-------|
| **Add Venue** | Click "Add Venue" → Fill form → Click "Add" |
| **Edit Venue** | Click "Edit" on card → Modify fields → Click "Update" |
| **Delete Venue** | Click trash icon → Confirm → Done |
| **View Venues** | Navigate to `/admin/venues` → Browse cards |

## ✅ Checklist

Before adding a venue, ensure:
- [ ] You're signed in as admin
- [ ] You have venue details ready (name, capacity)
- [ ] You know the venue status
- [ ] Description is optional but recommended

---

**Quick Path**: Admin Dashboard → Venue Management → Add/Edit/Delete → Done!

**Created & Designed by Luthfi ✦**

