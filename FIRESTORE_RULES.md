# Firestore Security Rules

## ⚠️ IMPORTANT: Set up Firestore Security Rules

Your app is getting a "Missing or insufficient permissions" error because Firestore security rules need to be configured.

## Steps to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `lexilog-c1559`
3. **Navigate to**: Firestore Database → Rules (in the left sidebar)
4. **Replace ALL the existing rules with this**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read/write their own words
      match /words/{wordId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

5. **Click "Publish"** button (top right) to save the rules
6. **Wait a few seconds** for the rules to propagate

## What these rules do:

- ✅ Users can only read/write their own profile (`users/{userId}`)
- ✅ Users can only read/write their own words (`users/{userId}/words/{wordId}`)
- ✅ Requires authentication (logged in users only)
- ✅ Prevents users from accessing other users' data

## After setting up rules:

1. **Refresh your app** (hard refresh: Ctrl+F5)
2. **Try logging in again**
3. The permissions error should be gone
4. You'll be able to save and load words

## Quick Setup Guide:

1. Open: https://console.firebase.google.com/project/lexilog-c1559/firestore/rules
2. Copy the rules above
3. Paste them in the rules editor
4. Click "Publish"
5. Done! ✅

---

**Note**: Without these rules, the app cannot save or load words. This is a required setup step.

