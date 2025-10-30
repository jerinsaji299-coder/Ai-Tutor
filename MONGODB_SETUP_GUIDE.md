# Quick MongoDB Setup Guide

The authentication system requires MongoDB to be running. You have two options:

## Option 1: MongoDB Atlas (Cloud - Recommended for Beginners) ☁️

**Free forever, no installation needed!**

### Step-by-Step:

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with your email (free forever)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select any cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your current IP)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://admin:<password>@cluster0...`)

6. **Update Backend .env**
   ```properties
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ai-tutor?retryWrites=true&w=majority
   MONGODB_OPTIONAL=false
   ```
   Replace `YOUR_PASSWORD` with your actual password!

7. **Restart Backend**
   ```bash
   cd backend
   node server.js
   ```

✅ **Done!** Signup/Login will now work!

---

## Option 2: Local MongoDB (Advanced Users) 💻

### Windows Installation:

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Choose "Windows"
   - Download the MSI installer

2. **Install MongoDB**
   - Run the MSI installer
   - Choose "Complete" installation
   - Install as a Windows Service ✓
   - Install MongoDB Compass (optional GUI) ✓

3. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

4. **Update Backend .env**
   ```properties
   MONGODB_URI=mongodb://localhost:27017/ai-tutor
   MONGODB_OPTIONAL=false
   ```

5. **Restart Backend**
   ```bash
   cd backend
   node server.js
   ```

### macOS Installation:

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Update .env
MONGODB_URI=mongodb://localhost:27017/ai-tutor
MONGODB_OPTIONAL=false

# Restart backend
cd backend
node server.js
```

### Linux Installation:

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Update .env
MONGODB_URI=mongodb://localhost:27017/ai-tutor
MONGODB_OPTIONAL=false

# Restart backend
cd backend
node server.js
```

---

## Verify Connection ✅

After setup, check if MongoDB connected:

1. Look for this in backend terminal:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   ```

2. Try signing up at http://localhost:3002/signup

3. If you see user created successfully → **MongoDB works!** 🎉

---

## Troubleshooting 🔧

### "Signup Failed" Error
- MongoDB not connected
- Check backend terminal for connection errors
- Verify `MONGODB_URI` in `.env` is correct
- Ensure `MONGODB_OPTIONAL=false` in `.env`

### "Network Error" on Signup
- Backend not running
- Check backend is on port 3000: http://localhost:3000/health

### MongoDB Atlas Connection Failed
- Check username/password in connection string
- Whitelist your IP in Network Access
- Wait 2-3 minutes after creating cluster

### Local MongoDB Won't Start
- Check if service is running: `net start MongoDB`
- Check MongoDB is installed: `mongod --version`
- Check port 27017 is not in use

---

## Quick Test 🧪

Once MongoDB is connected:

1. **Signup**: http://localhost:3002/signup
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Student

2. **Login**: http://localhost:3002/login
   - Email: test@example.com
   - Password: password123

3. **Success!** You'll see your name in the header and can access the dashboard.

---

## Need Help? 💬

- **MongoDB Atlas Issues**: https://www.mongodb.com/docs/atlas/
- **Local MongoDB Issues**: https://www.mongodb.com/docs/manual/installation/
- **Project Documentation**: See `AUTHENTICATION_IMPLEMENTATION.md`

---

**Estimated Setup Time:**
- MongoDB Atlas: 5-10 minutes
- Local MongoDB: 10-20 minutes

**Recommended:** Use MongoDB Atlas (Option 1) - it's free, faster to set up, and requires no local installation!
