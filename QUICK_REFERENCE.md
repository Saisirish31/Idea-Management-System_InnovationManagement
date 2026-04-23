# 🚀 Quick Reference Card

## Access URLs
Open these files in your browser:

### For Users
- **Login Page**: `login.html`
- **Register Page**: `register.html`
- **Main App**: `index.html` (requires login)

### For Admins
- **Admin Login**: `admin.html`
- **Admin Dashboard**: `admin-dashboard.html` (requires admin login)

## Default Credentials

### Demo User Account
```
📧 Email: demo@ims.com
🔑 Password: demo123
✅ Access: Main application
```

### Admin Account
```
📧 Email: admin@ims.com
🔑 Password: admin123
✅ Access: Admin dashboard
```

## File Locations

### HTML Pages
- `login.html` - User login (blue theme)
- `register.html` - New user registration
- `admin.html` - Admin login (red theme)
- `admin-dashboard.html` - Admin control panel
- `index.html` - Main idea management app

### Scripts & Styles
- `script.js` - All application logic
- `style.css` - Application styling

### Documentation
- `README.md` - Complete project overview
- `AUTH_GUIDE.md` - Authentication system guide
- `ADMIN_GUIDE.md` - Admin panel documentation
- `QUICK_REFERENCE.md` - This file

## Admin Capabilities

✅ View all registered users
✅ Delete any user
✅ See all ideas in system
✅ Export data to JSON files
✅ View system statistics
✅ Reset entire system
✅ Monitor database size

## Data Storage

Persistent data is stored in `data/store.json` on the backend server:
- `users` - All registered users
- `ideas` - All submitted ideas
- `lastBackup` - Last backup timestamp

Browser session keys:
- `imsCurrentUser` - Active user session
- `imsAdminUser` - Active admin session

## Export Data Formats

Admin can export:
1. **Complete Backup**: Users + Ideas + Statistics (JSON)
2. **Users Only**: All user data (JSON)
3. **Ideas Only**: All ideas data (JSON)

Files download with timestamps for version tracking.

## Navigation Flow

```
login.html
    ├─→ register.html (create account)
    ├─→ index.html (after user login)
    └─→ admin.html (admin access link)
            └─→ admin-dashboard.html (after admin login)
                    ├─→ User Management tab
                    ├─→ All Ideas tab
                    └─→ Data Backup tab
```

## Quick Actions

### As User
1. Open `login.html`
2. Login with demo account or create new account
3. Submit, vote, comment on ideas
4. View analytics and top ideas

### As Admin
1. Open `admin.html` (or click admin link on login page)
2. Login with admin credentials
3. Manage users, view all ideas, export data
4. Monitor system statistics

## Keyboard Shortcuts (Main App)

- `Escape` - Close any modal
- `Ctrl/Cmd + K` - Focus search box

## Common Tasks

### Create New User
1. Go to `register.html`
2. Fill form with email, password, name
3. Click "Create Account"

### Export All Data (Admin)
1. Login to admin panel
2. Go to "Data Backup" tab
3. Click "Export All Data"
4. JSON file downloads automatically

### Delete User (Admin)
1. Login to admin panel
2. Go to "User Management" tab
3. Find user in table
4. Click "Delete" button
5. Confirm deletion

### View All Ideas (Admin)
1. Login to admin panel
2. Click "All Ideas" tab
3. Browse complete ideas list

## Troubleshooting

**Can't login?**
- Check credentials match exactly
- Ensure backend server is running on `http://localhost:8080`
- Try demo account first

**Data not saving?**
- Verify `npm start` is running successfully
- Check `data/store.json` write permissions
- Confirm API is reachable at `/api/health`

**Admin panel not accessible?**
- Use correct admin credentials
- Clear admin session: `localStorage.removeItem("imsAdminUser")`
- Try different browser

---

## Support

For detailed documentation:
- **General**: See [README.md](README.md)
- **Authentication**: See [AUTH_GUIDE.md](AUTH_GUIDE.md)
- **Admin Features**: See [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
