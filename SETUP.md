# LexiLog Quick Setup Guide

## 🚀 Quick Start (Demo Mode)

1. **Open the demo version**:
   - Open `index-demo.html` in your web browser
   - No setup required - works immediately with localStorage

2. **Try it out**:
   - Enter your name when prompted
   - Search for words like "serendipity", "ephemeral", or "mellifluous"
   - Use the microphone button for voice search
   - Check out the Word of the Day feature

## 🔥 Full Setup (With Firebase)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard

### Step 2: Enable Services

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Anonymous" authentication

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode"

### Step 3: Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Copy the configuration object

### Step 4: Update Code

1. Open `app.js`
2. Replace the `firebaseConfig` object with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### Step 5: Run the App

1. **Using Python**:
   ```bash
   python -m http.server 8000
   ```

2. **Using Node.js**:
   ```bash
   npx http-server
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:8000`
   - Open `index.html` (not the demo version)

## 📁 File Structure

```
LexiLog/
├── index.html          # Full version with Firebase
├── index-demo.html     # Demo version (no Firebase)
├── app.js             # Full JavaScript with Firebase
├── app-demo.js        # Demo JavaScript (localStorage)
├── styles.css         # Custom styles
├── README.md          # Detailed documentation
└── SETUP.md           # This file
```

## 🎯 Features Comparison

| Feature | Demo Version | Full Version |
|---------|-------------|--------------|
| Word Search | ✅ | ✅ |
| Auto-Save | ✅ | ✅ |
| Voice Search | ✅ | ✅ |
| Word of the Day | ✅ | ✅ |
| Data Persistence | localStorage | Firestore |
| Cross-device Sync | ❌ | ✅ |
| Real-time Updates | ❌ | ✅ |
| User Accounts | ❌ | ✅ |

## 🛠️ Troubleshooting

### Demo Version Issues

- **Speech recognition not working**: Make sure you're using HTTPS or localhost
- **Words not saving**: Check browser console for errors
- **Audio not playing**: Some browsers block autoplay

### Full Version Issues

- **Firebase connection errors**: Check your configuration in `app.js`
- **Authentication errors**: Ensure Anonymous auth is enabled
- **Database errors**: Check Firestore rules and permissions

## 🚀 Next Steps

1. **Try the demo** to understand the features
2. **Set up Firebase** for full functionality
3. **Customize the UI** by modifying `styles.css`
4. **Add new features** following the patterns in `app.js`

## 📞 Support

- Check the main `README.md` for detailed documentation
- Review browser console for error messages
- Ensure all files are in the same directory

---

**Happy vocabulary building! 📚✨**
