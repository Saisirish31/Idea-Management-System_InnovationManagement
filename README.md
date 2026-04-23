# Idea Management System (IMS)

A comprehensive web-based application for managing and tracking innovative ideas through the innovation funnel. Built with vanilla HTML, CSS, JavaScript, and a Node.js backend with JSON file persistence.

## 🌟 Features

### 🔐 Authentication System
- **User Registration**: Create account with email and password
- **Login System**: Secure login with remember me option
- **Session Management**: Persistent user sessions
- **User Profiles**: Display user info with avatar initials
- **Demo Account**: Quick access with pre-configured credentials
  - Email: `demo@ims.com`
  - Password: `demo123`
- **Logout**: Secure logout functionality

### 👑 Admin Panel
- **Separate Admin Login**: Independent admin authentication system
  - Email: `admin@ims.com`
  - Password: `admin123`
- **User Management**: View all registered users, see user details, delete users
- **System Overview**: Real-time statistics dashboard (total users, ideas, votes, comments)
- **All Ideas View**: Browse and manage every idea in the system
- **Data Export**: Download complete backups as JSON files
  - Export all data (users + ideas + statistics)
  - Export users only
  - Export ideas only
- **System Maintenance**: Clear users, reset entire system
- **Database Statistics**: Monitor storage size and last backup time
- For complete admin documentation, see [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

### Core Functionality
- **Idea Submission**: Submit ideas with title, description, category, impact/feasibility scores, rating, and funnel stage
- **User Attribution**: Each idea shows who created it
- **Idea Management**: Edit, delete, and organize ideas
- **Voting System**: Upvote/downvote ideas to show community support
- **Comments**: Add collaborative feedback to any idea
- **Search & Filter**: Search by text, filter by category and stage
- **Sorting**: Sort ideas by newest, rating, screening score, or votes (ascending/descending)
- **Top 5 Dashboard**: View the top 5 most promising ideas with ranking badges

### Analytics & Insights
- **Real-time Statistics**:
  - Total ideas count
  - Average rating across all ideas
  - Average screening score
  - Total votes
- **Innovation Funnel Visualization**: Visual progress bars showing idea distribution across 4 stages:
  - Idea (Initial submission)
  - Screening (Evaluation phase)
  - Prototype (Development stage)
  - Implementation (Execution phase)

### User Experience
- **Success/Error Messages**: Toast notifications for all actions
- **Form Validation**: Visual feedback for missing or invalid fields
- **Keyboard Shortcuts**:
  - `Escape`: Close any open modal
  - `Ctrl/Cmd + K`: Focus search box
- **Empty States**: Helpful messages when no ideas match filters
- **Results Counter**: Shows number of ideas displayed
- **Scroll to Top**: Quick navigation button for long lists
- **Help Modal**: Built-in documentation and shortcuts guide
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Data Management
- **File-Based Persistence**: All data saved in `data/store.json` via backend API
- **Export to JSON**: Download complete data report with timestamp
- **Reset Data**: Restore sample ideas for testing/demo
- **Clear Filters**: Quick reset of all search and filter criteria
- **Sample Data**: Pre-loaded with 5 example ideas

### Accessibility
- **ARIA Labels**: Proper accessibility attributes
- **Keyboard Navigation**: Full keyboard support
- **Print-Friendly**: Optimized print stylesheet
- **Semantic HTML**: Proper heading hierarchy and structure

## 🎯 Scoring System

**Screening Score** = Impact + Feasibility (Max: 10 points)

- **Impact** (1-5): Potential business impact of the idea
- **Feasibility** (1-5): How practical/achievable the idea is
- Higher scores indicate more promising ideas for implementation

## 🚀 Getting Started

### Quick Start
1. Install dependencies:
  - `npm install`
2. Start server:
  - `npm start`
3. Open `http://localhost:8080/login.html`
4. Use demo credentials or create a new account:
   - **Demo Email**: `demo@ims.com`
   - **Demo Password**: `demo123`
5. Start managing ideas!

### Backend Server
```bash
npm install
npm start
```

Then navigate to `http://localhost:8080`

## 📁 Project Structure

```
Idea Management System/
├── login.html          # User login page
├── register.html       # User registration page
├── admin.html          # Admin login page
├── admin-dashboard.html # Admin control panel
├── admin-dashboard.js  # Admin dashboard logic
├── index.html          # Main application page (protected)
├── script.js           # All JavaScript functionality
├── style.css           # Styling and responsive design
├── server.js           # Node.js backend API server
├── package.json        # Node.js dependencies and scripts
├── data/store.json     # Persistent data file (users, ideas, backups)
├── PRESENTATION.html   # Project presentation slides
├── README.md          # This file
├── AUTH_GUIDE.md      # Authentication system documentation
└── ADMIN_GUIDE.md     # Admin panel documentation
```

## 🎨 Technology Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, animations
- **JavaScript (ES6+)**: All business logic and interactivity
- **Node.js + Express**: Backend API and static file hosting
- **JSON File Storage**: Persistent backend data in `data/store.json`
- **Google Fonts**: Professional typography (Archivo, Plus Jakarta Sans)

## 💻 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Opera (v76+)

## 📊 Data Structure

### User Object
```json
{
  "id": "user-1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "createdAt": "2026-03-09T10:00:00.000Z"
}
```

### Idea Object
Each idea is stored as a JSON object:
```json
{
  "id": "id-1234567890",
  "title": "Idea Title",
  "description": "Detailed description",
  "category": "Product|Process|Marketing|Social",
  "impact": 5,
  "feasibility": 4,
  "rating": 5,
  "stage": "Idea|Screening|Prototype|Implementation",
  "votes": 10,
  "comments": ["Comment 1", "Comment 2"],
  "createdBy": {
    "id": "user-1234567890",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2026-03-09T10:00:00.000Z"
}
```

## 🎯 Use Cases

- Corporate innovation initiatives
- Startup idea validation and tracking
- Team brainstorming sessions
- Academic projects (Innovation Management courses)
- Internal employee suggestion programs
- Product development pipeline management

## 🛠️ Customization

### Adding New Categories
Edit the category options in `index.html` (lines ~110-115):
```html
<select id="idea-category">
  <option value="Product">Product</option>
  <option value="Custom">Custom Category</option>
</select>
```

### Changing Color Scheme
Modify CSS variables in `style.css` (lines 1-8):
```css
:root {
  --primary: #2551d7;
  --accent: #f4a42b;
  /* ... other variables */
}
```

### Adjusting Funnel Stages
Update the `stageOptions` array in `script.js` (line 54).

## 📝 Features Checklist

✅ User registration with validation  
✅ User login with demo account  
✅ Session management  
✅ User profile with avatar  
✅ Logout functionality  
✅ Protected routes (auth required)  
✅ Add new ideas with user attribution  
✅ Edit existing ideas  
✅ Delete ideas (with confirmation)  
✅ Vote on ideas (up/down)  
✅ Add comments  
✅ Search functionality  
✅ Filter by category  
✅ Filter by stage  
✅ Multiple sort options  
✅ Sort direction toggle  
✅ Top 5 ideas ranking  
✅ Real-time statistics  
✅ Innovation funnel visualization  
✅ Export data as JSON  
✅ Reset to sample data  
✅ Clear all filters  
✅ Help documentation  
✅ Keyboard shortcuts  
✅ Success/error messages  
✅ Form validation  
✅ Empty state handling  
✅ Results counter  
✅ Scroll to top  
✅ Responsive design  
✅ Print-friendly  
✅ Accessibility support  

## 🎓 Academic Context

This project was developed for the **Innovation Management** course (SEM-6) to demonstrate practical application of innovation management principles including:
- Innovation funnel methodology
- Idea screening and evaluation
- Collaborative innovation
- Data-driven decision making
- Innovation metrics and KPIs

## 📄 License

This project is open source and available for educational purposes.

## 👥 Contributing

This is an academic project, but suggestions and improvements are welcome!

## 📧 Support

For questions or issues, please refer to the built-in Help modal (ℹ Help button) in the application.

---

**Last Updated**: March 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
