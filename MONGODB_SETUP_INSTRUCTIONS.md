# MongoDB Local Setup Instructions

## Quick Fix - Start MongoDB Service

### Option 1: Using Windows Services (Recommended)
1. Press `Win + R` to open Run dialog
2. Type `services.msc` and press Enter
3. Find "MongoDB" or "MongoDB Server" in the list
4. Right-click and select "Start"
5. (Optional) Right-click → Properties → Set Startup Type to "Automatic"

### Option 2: Using Command Prompt as Administrator
1. Right-click on `START_MONGODB.bat` file
2. Select "Run as administrator"
3. MongoDB service will start

### Option 3: Using PowerShell as Administrator
```powershell
Start-Service MongoDB
```

### Option 4: Start MongoDB Manually
1. Open Command Prompt as Administrator
2. Navigate to MongoDB bin folder:
   ```
   cd "C:\Program Files\MongoDB\Server\7.0\bin"
   ```
   (Replace 7.0 with your MongoDB version if different)
3. Run:
   ```
   mongod.exe --dbpath "C:\data\db"
   ```

## Verify MongoDB is Running

Run this in any terminal:
```bash
mongosh --eval "db.version()"
```

Or check if port 27017 is listening:
```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

## Configuration Updated

Your `.env` file has been updated to use:
```
MONGODB_URI=mongodb://localhost:27017/ai-tutor
```

## After Starting MongoDB

1. Restart your backend server:
   ```bash
   cd backend
   node server.js
   ```

2. You should see:
   ```
   ✅ MongoDB Connected: localhost
   📦 Database Name: ai-tutor
   ```

## Troubleshooting

### MongoDB Service Not Found
If you don't see MongoDB in services:
1. Open Command Prompt as Administrator
2. Install MongoDB as a service:
   ```
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" --install
   ```

### Data Directory Missing
If you get "Data directory not found" error:
1. Create the directory:
   ```
   mkdir C:\data\db
   ```
2. Try starting MongoDB again

### Port 27017 Already in Use
Check what's using the port:
```powershell
Get-NetTCPConnection -LocalPort 27017
```

Kill the process if needed and restart MongoDB.

## Benefits of Local MongoDB

✅ Faster connection (no network latency)
✅ No IP whitelist issues
✅ Works offline
✅ Free and unlimited for development
✅ Data persists on your machine
✅ No Atlas account needed

## Need Help?

If MongoDB still doesn't work after trying these steps:
1. Check MongoDB is installed: Look for "MongoDB" folder in `C:\Program Files\MongoDB\`
2. Check MongoDB version: Open the folder and note the version number
3. Verify installation: Look for `mongod.exe` and `mongosh.exe` in the `bin` folder

The app will now use your **local MongoDB** instead of MongoDB Atlas! 🎉
