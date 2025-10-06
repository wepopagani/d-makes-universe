# Firebase Setup Guide

## Introduction
This guide will help you set up Firebase authentication for the D-Makes-Universe application. The application is currently showing authentication errors due to missing Firebase configuration credentials.

## Steps to Set Up Firebase Authentication

### 1. Create or Access Your Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Create a new project or select your existing project

### 2. Register Your Web App
1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview" to access Project settings
2. Scroll down to the "Your apps" section
3. Click on the "</>" (Web) icon to add a web app
4. Enter a nickname for your app (e.g., "D-Makes-Universe Web")
5. Register the app

### 3. Get Your Firebase Configuration
After registering the app, Firebase will display your configuration. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 4. Update Your Firebase Configuration File
1. Open the file `src/firebase/config.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  // Replace with your actual API key
  authDomain: "YOUR_AUTH_DOMAIN",  // Replace with your actual auth domain
  projectId: "YOUR_PROJECT_ID",  // Replace with your actual project ID
  storageBucket: "YOUR_STORAGE_BUCKET",  // Replace with your actual storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Replace with your actual messaging sender ID
  appId: "YOUR_APP_ID"  // Replace with your actual app ID
};
```

### 5. Enable Authentication Methods in Firebase Console
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click on "Sign-in method" tab
3. Enable the authentication methods you want to use:
   - Email/Password
   - Google
   - Any other providers you need

### 6. Test Your Application
After updating the configuration and enabling authentication methods, restart your application and test the authentication features.

## Security Considerations
- Never commit your real Firebase configuration values to public repositories
- Consider using environment variables for production environments
- Implement Firebase Security Rules to protect your data

## Troubleshooting
If you encounter issues:
1. Check that you've copied all the configuration values correctly
2. Verify that you've enabled the authentication methods in the Firebase Console
3. Look for errors in the browser console (F12 > Console)
4. Make sure your Firebase project billing account is set up correctly if applicable

## Further Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 