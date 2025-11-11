# Firestore Security Rules

## ⚠️ IMPORTANT: Set up Firestore Security Rules

Your app is getting a "Missing or insufficient permissions" error because Firestore security rules need to be configured.

## Steps to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `lexilog-c1559`
3. **Navigate to**: Firestore Database → Rules
4. **Replace the rules with this**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own profile
    match /artifacts/lexilog-vocabulary-builder/users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read/write their own vocabulary
      match /vocabulary/{wordId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

5. **Click "Publish"** to save the rules

## What these rules do:

- ✅ Users can only read/write their own profile
- ✅ Users can only read/write their own vocabulary words
- ✅ Requires authentication (logged in users only)
- ✅ Prevents users from accessing other users' data

## After setting up rules:

1. Refresh your app
2. Try logging in again
3. The permissions error should be gone
4. You'll be able to save and load words

---

**Note**: The app will still work even without these rules (it just won't save/load data), but you'll see errors in the console. Setting up these rules is recommended for full functionality.

