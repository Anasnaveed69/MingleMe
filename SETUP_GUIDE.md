# MingleMe Setup Guide

This guide will help you set up MongoDB Atlas, Cloudinary, and email configuration for your MingleMe application.

## 📋 Prerequisites
- A Gmail account (for email)
- A Cloudinary account (free tier available)
- A MongoDB Atlas account (free tier available)

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Try Free" and create an account
3. Choose the **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>`, `<password>`, and `<dbname>` with your values

**Example:**
```
mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/mingleme?retryWrites=true&w=majority
```

**Add to your `.env`:**
```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/mingleme?retryWrites=true&w=majority
```

**Database & Collection Names:**
- **Database Name**: `mingleme` (from the connection string)
- **Collections**: MongoDB will automatically create these collections when you first use them:
  - `users` - Stores user accounts, profiles, and authentication data
  - `posts` - Stores all posts, comments, likes, and media

---

## ☁️ Cloudinary Setup

### Step 1: Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Create an account

### Step 2: Get Your Credentials
1. After signing up, you'll be taken to your dashboard
2. Look for the "Account Details" section
3. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

**Add to your `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Configure Upload Settings (Optional)
1. In your Cloudinary dashboard, go to "Settings" → "Upload"
2. You can set upload presets, folder structure, etc.
3. For MingleMe, the default settings work fine

---

## 📧 Email Setup (Gmail with App Password)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Click "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Security settings, click "App passwords"
2. Select "Mail" as the app
3. Select "Other" as the device
4. Enter "MingleMe" as the name
5. Click "Generate"
6. Copy the 16-character password (no spaces)

### Step 3: Configure Email Settings
**Add to your `.env`:**
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=MingleMe <noreply@mingleme.com>
```

**Important Notes:**
- Use your full Gmail address for `EMAIL_USER`
- Use the 16-character app password (not your regular Gmail password)
- The `EMAIL_FROM` can be customized but must use your Gmail address

---

## 🔐 JWT Secret Setup

### Generate a Strong JWT Secret
You can generate a secure JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Add to your `.env`:**
```env
JWT_SECRET=your_generated_64_character_hex_string
```

---

## 📝 Complete .env File Example

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/mingleme?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_generated_64_character_hex_string
JWT_EXPIRE=7d

# Email Configuration (for OTP) - Gmail with App Password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=MingleMe <noreply@mingleme.com>

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Testing Your Setup

### Step 1: Create .env File
```bash
cp backend/env.example backend/.env
```

### Step 2: Fill in Your Values
Edit `backend/.env` with your actual credentials from the steps above.

### Step 3: Test the Setup
```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀 MingleMe Server running on port 5000
📱 Environment: development
🔗 API URL: http://localhost:5000/api
MongoDB Connected: your-cluster.mongodb.net
```

---

## 🔒 Security Best Practices

### For Development:
- Use the free tiers of all services
- Allow all IPs in MongoDB Atlas
- Use app passwords for Gmail

### For Production:
- Use paid tiers for better performance
- Restrict MongoDB Atlas to specific IPs
- Use environment variables in your hosting platform
- Never commit `.env` files to version control
- Use strong, unique passwords and secrets

---

## 🆘 Troubleshooting

### MongoDB Connection Issues:
- Check if your IP is whitelisted in MongoDB Atlas
- Verify username/password in connection string
- Ensure cluster is running

### Cloudinary Upload Issues:
- Verify API key and secret
- Check if your account is active
- Ensure you're within free tier limits

### Email Issues:
- Verify 2FA is enabled on Gmail
- Check app password is correct
- Ensure Gmail account is not locked

### JWT Issues:
- Generate a new JWT secret if needed
- Ensure secret is at least 32 characters long 