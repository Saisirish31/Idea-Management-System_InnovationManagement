# Admin System Guide

## Overview
The Idea Management System now includes a complete admin panel for managing users and system data.

## Accessing Admin Panel

### Admin Login
- **URL**: Open `admin.html` in your browser
- **Credentials**:
  - Email: `admin@ims.com`
  - Password: `admin123`

### Access Points
- From user login page: Click "👑 Admin Access" link at the bottom
- Direct access: Navigate to `admin-dashboard.html` (requires admin login)

## Admin Dashboard Features

### 1. System Overview
Dashboard displays real-time statistics:
- **Total Users**: Number of registered users
- **Total Ideas**: All ideas submitted in the system
- **Total Votes**: Cumulative votes across all ideas
- **Total Comments**: All comments made on ideas

### 2. User Management
View and manage all registered users:
- **User List**: Table showing all users with:
  - Name and email
  - Registration date
  - Number of ideas created
  - Action buttons (View, Delete)

#### User Actions
- **View Details**: Shows user information and their ideas
- **Delete User**: Removes user and all their ideas (with confirmation)

### 3. All Ideas View
Browse every idea in the system:
- View all ideas across all users
- See idea details: title, description, creator, category, stage
- View engagement metrics: rating, votes, comments

### 4. Data Backup & Export

#### Export Options
- **Export All Data**: Complete system backup (users + ideas + statistics)
- **Export Users Only**: Just user data as JSON
- **Export Ideas Only**: Just ideas data as JSON

All exports are downloadable as JSON files with timestamps.

#### System Statistics
- Database size in KB
- Last backup timestamp

#### Danger Zone
**⚠️ Use with caution - these actions are permanent:**
- **Delete All Users**: Removes all users and their ideas
- **Reset Entire System**: Complete database wipe (requires "RESET" confirmation)

## Data Storage

Persistent data is stored server-side in `data/store.json`:
- `users` - User accounts
- `ideas` - All ideas
- `lastBackup` - Timestamp of last backup

Browser session keys are still used for login state:
- `imsAdminUser` - Admin session
- `imsCurrentUser` - Regular user session

## Security

### Admin Authentication
- Separate login from regular users
- Admin credentials stored independently
- Admin session tracked separately from user sessions

### Data Integrity
- User deletion includes their ideas (cascading delete)
- Confirmation dialogs for destructive actions
- Backup timestamp tracking

## Navigation

### From Admin Panel
- **User dropdown menu**: Access "Go to Main App" to visit the regular application
- **Logout**: Returns to admin login page

### From Main Application
- Admins can return to admin panel via the login page

## File Structure

```
admin.html              # Admin login page
admin-dashboard.html    # Admin control panel
login.html              # User + admin access link
```

## Best Practices

### Regular Backups
1. Access "Data Backup" tab
2. Click "Export All Data"
3. Save JSON file securely
4. Recommended: Export before major changes

### User Management
- Review user activity before deletion
- Check number of ideas before removing users
- Export user data before deletion for records

### System Maintenance
- Monitor database size in statistics
- Regular data exports for backup
- Review system overview for activity metrics

## Troubleshooting

### Cannot Access Admin Panel
- Verify you're using correct credentials: `admin@ims.com` / `admin123`
- Ensure backend server is running on `http://localhost:8080`
- Check browser console for errors

### Data Not Showing
- Ensure `server.js` is running and API routes are reachable
- Check if users/ideas exist in the system
- Verify data wasn't accidentally deleted

### Export Not Working
- Check browser allows downloads
- Ensure popup blocker isn't blocking downloads
- Try different browser if issue persists

## Admin vs. User Comparison

| Feature | Regular User | Admin |
|---------|-------------|-------|
| Login Page | login.html (blue theme) | admin.html (red theme) |
| Session Key | imsCurrentUser | imsAdminUser |
| Can Create Ideas | ✅ Yes | ⚠️ Via main app |
| Can Vote/Comment | ✅ Yes | ⚠️ Via main app |
| View All Users | ❌ No | ✅ Yes |
| Delete Users | ❌ No | ✅ Yes |
| Export Data | ❌ No | ✅ Yes |
| System Reset | ❌ No | ✅ Yes |

## Demo Accounts

### Regular User
- Email: `demo@ims.com`
- Password: `demo123`

### Admin
- Email: `admin@ims.com`
- Password: `admin123`

---

## Support & Development

For issues or feature requests, refer to the main [README.md](README.md) and [AUTH_GUIDE.md](AUTH_GUIDE.md).
