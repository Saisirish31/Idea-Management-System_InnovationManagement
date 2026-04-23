# Authentication Guide

## 🔐 Getting Started with Authentication

### First Time Users

#### Option 1: Use Demo Account (Fastest)
1. Open `login.html` in your browser
2. Use these credentials:
   - **Email**: `demo@ims.com`
   - **Password**: `demo123`
3. Click "Sign In"
4. You're redirected to the main application!

#### Option 2: Create Your Own Account
1. Open `login.html` in your browser
2. Click "Create Account" at the bottom
3. Fill in:
   - Your full name
   - Email address (must be unique)
   - Password (minimum 6 characters)
   - Confirm password
4. Check "I agree to the Terms" checkbox
5. Click "Create Account"
6. You'll be redirected to login page
7. Sign in with your new credentials

---

## 🎯 Features

### Registration Features
- **Real-time Validation**: See errors as you type
- **Password Strength Indicator**: Visual feedback on password security
- **Email Uniqueness Check**: Prevents duplicate accounts
- **Success Indicators**: Green checkmarks when fields are valid
- **Responsive Design**: Works on all devices

### Login Features
- **Demo Credentials Display**: Quick access to test account
- **Remember Me**: Stay logged in between sessions
- **Password Toggle**: Show/hide password option
- **Error Messages**: Clear feedback on login issues
- **Auto-redirect**: Sends you to main app after successful login

### Security Features
- **Protected Routes**: Main app requires authentication
- **Session Management**: Session state in browser, user records on backend API
- **Auto-logout**: Logout button in user menu
- **Password Validation**: Minimum length requirements
- **Email Format Check**: Ensures valid email addresses

---

## 👤 User Profile

### Viewing Your Profile
1. Look at the top-right corner of the main app
2. You'll see a circular avatar with your initials
3. Click on it to open the user menu

### User Menu Options
- **Your Name**: Displayed at the top
- **Your Email**: Shows your registered email
- **Logout Button**: Click to sign out

### User Attribution
- Every idea you create shows your name
- Look for the "👤 Your Name" badge on ideas
- This helps track who submitted each innovation

---

## 🔄 Session Management

### How Sessions Work
- When you log in, your info is saved in browser storage
- You stay logged in until you click "Logout"
- Using "Remember Me" keeps you logged in longer
- Closing the browser doesn't log you out

### Logging Out
1. Click your avatar in top-right corner
2. Click the "🚪 Logout" button
3. Confirm you want to logout
4. You'll be redirected to login page

---

## 🛠️ Technical Details

### Data Storage
- **User Data**: Stored server-side in `data/store.json`
- **Ideas Data**: Stored server-side in `data/store.json`
- **Current Session**: Stored in browser under key `imsCurrentUser`
- **Remember Me**: Stored under key `imsRememberMe`

### User Object Structure
```json
{
  "id": "user-1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "plaintext_password",
  "createdAt": "2026-03-09T10:00:00.000Z"
}
```

**Note**: This project now uses a backend server with JSON file persistence. Passwords are still plain text for demo purposes and should be hashed in production.

### Session Object Structure
```json
{
  "id": "user-1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "loginTime": "2026-03-09T12:30:00.000Z"
}
```

---

## ❓ Troubleshooting

### Can't Login?
- **Check email**: Make sure it's the exact email you registered with
- **Check password**: Passwords are case-sensitive
- **Try demo account**: Use `demo@ims.com` / `demo123` to test
- **Check server**: Ensure backend is running (`npm start`)

### Registration Not Working?
- **Email already exists**: Try a different email address
- **Password too short**: Use at least 6 characters
- **Terms not checked**: Must accept terms to register
- **Invalid email format**: Ensure email has proper format (user@domain.com)

### Constant Redirects?
- **Server unavailable**: Confirm `http://localhost:8080/api/health` responds
- **Private/Incognito mode**: May not work properly
- **Clear cache**: Try clearing browser cache and cookies

### Lost Your Password?
Since this is still a demo app without password reset flow:
1. Open `data/store.json`
2. Locate the user entry under `users`
3. Update password manually for testing
4. Save file and retry login

---

## 🎨 Customization

### Changing Demo Credentials
Edit `login.html`, find this section:
```html
<div class="demo-credentials">
  <strong>🎯 Demo Credentials</strong>
  <p>Email: <code>demo@ims.com</code></p>
  <p>Password: <code>demo123</code></p>
</div>
```

Update the credentials in the JavaScript section:
```javascript
if (email === "demo@ims.com" && password === "demo123") {
  // Change these values
}
```

### Adding Password Requirements
Edit `register.html`, find the `calculatePasswordStrength` function:
```javascript
function calculatePasswordStrength(password) {
  // Add custom requirements here
}
```

---

## 🔒 Security Notes

### Important Disclaimers
⚠️ **This is a demo application**
- Passwords are currently stored in plain text in `data/store.json`
- Basic server-side validation only (no hashing/JWT yet)
- Not suitable for production use with real data
- Anyone with file access can see stored passwords

### For Production Use
If deploying for real users:
- ✅ Use a backend server (Node.js, PHP, Python, etc.)
- ✅ Hash passwords with bcrypt or similar
- ✅ Use HTTPS for all connections
- ✅ Implement proper session tokens (JWT)
- ✅ Add email verification
- ✅ Add password reset functionality
- ✅ Implement rate limiting
- ✅ Add CSRF protection
- ✅ Use secure cookies instead of localStorage

---

## 📞 Need Help?

- Check the built-in Help modal (ℹ Help button) in the app
- Review the main README.md for general features
- Open browser console (F12) to see any error messages

---

**Last Updated**: March 9, 2026  
**Authentication System Version**: 1.0.0
