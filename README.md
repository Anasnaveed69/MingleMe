# 🚀 MingleMe - Modern Social Media Platform

A full-featured social media platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that enables users to create accounts, share posts, interact with others, and build communities.

## ✨ Features Overview

### 🔐 **Authentication & Security**
- **Multi-step Registration**: Sign up with email verification via OTP
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Email Verification**: OTP-based email verification for new accounts
- **Session Management**: Persistent login with secure token storage

### 📝 **Posts & Content**
- **Rich Posts**: Create posts with text, multiple images, and hashtags
- **Real-time Feed**: Infinite scroll with lazy loading
- **Engagement**: Like, comment, and share posts
- **Content Management**: Edit and delete your own posts
- **Media Upload**: Cloudinary integration for image storage
- **Post Discovery**: Search posts by hashtags, users, or content

### 👥 **User Profiles**
- **Customizable Profiles**: Upload avatar, cover photo, and bio
- **Follow System**: Follow/unfollow users with real-time updates
- **Profile Analytics**: View follower/following counts and post statistics
- **Activity History**: View your posts, likes, and comments
- **Privacy Settings**: Control who can see your content

### 🔔 **Notifications**
- **Real-time Alerts**: Get notified for likes, comments, follows
- **Notification Center**: View all notifications in one place
- **Read Status**: Mark notifications as read/unread
- **Email Notifications**: Optional email alerts for important activities

### 💬 **Social Features**
- **Comments**: Add, edit, and delete comments on posts
- **Likes**: Like/unlike posts and comments
- **User Search**: Find users by username or name
- **User Profiles**: View other users' profiles and posts
- **Responsive Design**: Works perfectly on mobile and desktop

### 🎨 **UI/UX Features**
- **Modern Design**: Clean, responsive interface with TailwindCSS
- **Dark Mode**: Toggle between light and dark themes
- **Smooth Animations**: Framer Motion for fluid interactions
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and toasts
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ **Tech Stack**

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage and CDN
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **React 18** - UI library with hooks
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **React Dropzone** - File upload
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Infinite Scroll** - Infinite scrolling

### **Development Tools**
- **Vercel** - Frontend deployment
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - Image hosting
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 **Project Structure**

```
MingleMe/
├── backend/                    # Express.js API
│   ├── middleware/            # Authentication & validation
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── utils/                # Helper functions
│   ├── server.js            # Server entry point
│   ├── vercel.json          # Vercel deployment config
│   └── .env.example         # Environment variables template
│
├── frontend/                  # React.js client
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state stores
│   │   ├── services/       # API service functions
│   │   ├── utils/         # Helper utilities
│   │   └── App.jsx        # Main application component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── README.md               # This file
├── SETUP_GUIDE.md          # Detailed setup instructions
└── .gitignore             # Git ignore rules
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js v16+ installed
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)
- Git installed

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/MingleMe.git
   cd MingleMe
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env` file in backend folder:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mingleme

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Email (Gmail App Password)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM=MingleMe <noreply@mingleme.com>

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🌐 **API Endpoints**

### **Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP email
- `GET /api/auth/profile` - Get current user profile

### **Posts**
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (owner only)
- `DELETE /api/posts/:id` - Delete post (owner only)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id/comments/:commentId` - Delete comment

### **Users**
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/follow/:id` - Follow/unfollow user
- `GET /api/users/search?q=query` - Search users
- `POST /api/upload/avatar` - Upload profile picture
- `POST /api/upload/cover` - Upload cover photo

### **Notifications**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🚀 **Deployment Guide**

### **Backend Deployment (Vercel)**
```bash
cd backend
vercel --prod
```

### **Frontend Deployment (Vercel)**
```bash
cd frontend
vercel --prod
```

### **Environment Variables for Production**
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **Manual Testing Checklist**
- [ ] User registration and email verification
- [ ] Login/logout functionality
- [ ] Post creation with images
- [ ] Like and comment features
- [ ] Follow/unfollow users
- [ ] Profile updates
- [ ] Notification system
- [ ] Responsive design on mobile
- [ ] Image upload functionality
- [ ] Search functionality

## 🐛 **Common Issues & Solutions**

### **CORS Issues**
- Ensure `FRONTEND_URL` matches your deployed frontend domain
- Check CORS configuration in backend/server.js

### **Email Issues**
- Use Gmail App Password instead of regular password
- Enable 2FA on Gmail account
- Check spam folder for OTP emails

### **Image Upload Issues**
- Verify Cloudinary credentials
- Check file size limits (10MB max)
- Ensure proper file types (jpg, png, gif)

### **Database Connection**
- Check MongoDB Atlas whitelist
- Verify connection string format
- Ensure database user has correct permissions

## 🤝 **Contributing**

I welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### **Contribution Guidelines**
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ **Support**

- **Issues**: [GitHub Issues](https://github.com/yourusername/MingleMe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/MingleMe/discussions)
- **Email**: support@mingleme.com

## 📊 **Project Stats**

- **Frontend**: React 18 with modern hooks
- **Backend**: Express.js with RESTful API
- **Database**: MongoDB Atlas cloud database
- **Images**: Cloudinary CDN for fast delivery
- **Deployment**: Vercel for both frontend and backend
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, rate limiting

---

**Built with ❤️ by Anas Butt**
