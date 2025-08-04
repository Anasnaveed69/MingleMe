# MingleMe - Mini Social Media Platform

A modern social media platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to create accounts, share posts, and interact with others.

## 🚀 Features

### Authentication
- User signup and login with JWT
- Password hashing with bcrypt
- OTP verification for new accounts
- Secure token-based authentication

### Posts
- Create posts with text and images
- View feed of all posts
- Like and comment on posts
- Delete own posts and comments
- Search and filter posts

### Profile
- View and edit profile details
- Upload profile image
- View personal post history

### UI/UX
- Responsive design for mobile and desktop
- Modern component-based architecture
- Modal forms and toast notifications
- Smooth animations and interactions
- Infinite scroll for feed

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Zustand** - State management
- **TailwindCSS** - Styling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Framer Motion** - Animations

## 📁 Project Structure

```
MingleMe/
├── backend/                 # Express.js server
│   ├── config/             # Database and email config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Server entry point
│
├── frontend/               # React.js client
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── store/         # Zustand store
│       ├── hooks/         # Custom hooks
│       ├── utils/         # Helper functions
│       └── App.jsx        # Main app component
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MingleMe
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   - Copy `.env.example` to `.env` in the backend folder
   - Update the environment variables with your configuration

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mingleme
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/auth/profile` - Get user profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id/comments/:commentId` - Delete comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile image

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for the Fluxxion MERN Fellowship 