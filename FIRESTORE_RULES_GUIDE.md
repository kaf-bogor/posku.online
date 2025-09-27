# Firestore Security Rules Guide

## Overview
This document explains the Firestore security rules for the Posku Online quiz application with comprehensive access control for all collections.

## 🔒 Security Levels

### **Public Access**
- ✅ **Quizzes**: Anyone can browse and view quiz lists
- ✅ **Published News**: Public can read published news articles
- ✅ **Active Events**: Public can view active events
- ✅ **Published Campaigns**: Public can view amal and kelas campaigns

### **Authenticated User Access**
- ✅ **User Profile**: Users can manage their own profile
- ✅ **Quiz Attempts**: Users can submit attempts and view their own history
- ✅ **Comments**: Users can create and edit their own comments

### **Admin-Only Access**
- 🔐 **Quiz Management**: Create, edit, delete quizzes
- 🔐 **Content Management**: Manage news, events, campaigns
- 🔐 **User Management**: View all user profiles and quiz attempts
- 🔐 **Comment Moderation**: Approve, edit, delete any comments

## 📋 Collection Rules Breakdown

### **Users Collection** (`/users/{userId}`)
```javascript
// Users can manage their own profile
allow read, write: if isOwner(userId);

// Admins can read all profiles
allow read: if isAdmin();

// Auto-create profile on first login
allow create: if authenticated && valid profile data;
```

### **Quizzes Collection** (`/quizzes/{quizId}`)
```javascript
// Public can browse quizzes
allow read: if true;

// Admins only can manage quizzes
allow create, update, delete: if isAdmin();

// Validate quiz data structure
- title, description, level, timeLimit required
- questions array with valid structure
- createdBy must match authenticated user
```

### **Quiz Attempts Collection** (`/quiz_attempts/{attemptId}`)
```javascript
// Users can read their own attempts
allow read: if isOwner(attempt.userId);

// Users can submit one attempt per quiz
allow create: if authenticated &&
               valid attempt data &&
               no existing attempt;

// Attempts are immutable (no updates)
allow update: if false;
```

### **Admin Collection** (`/admin/{email}`)
```javascript
// Anyone can check admin status
allow read: if authenticated;

// Only existing admins can add new admins
allow write: if isAdmin();
```

## 🛡️ Security Features

### **Data Validation**
- **Quiz Structure**: Validates title, description, level, time limit, questions format
- **Question Format**: Ensures 4 options, valid answer (A/B/C/D), required fields
- **Attempt Data**: Validates score range (0-100), required fields, data types
- **User Profiles**: Validates email matches auth token, required fields

### **Access Control**
- **One Attempt Per Quiz**: Prevents multiple attempts on same quiz
- **Owner-Only Access**: Users can only access their own data
- **Admin Verification**: Checks admin collection for authorization
- **Immutable Attempts**: Quiz submissions cannot be modified after creation

### **Rate Limiting Protection**
- **Authenticated Operations**: All writes require authentication
- **Admin-Only Management**: Content management restricted to admins
- **Validation Rules**: Prevent malformed data submission

## 🚀 Deployment Instructions

### **1. Using Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the rules from `firestore.rules`
5. Click **Publish**

### **2. Using Firebase CLI**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### **3. Verify Deployment**
After deployment, test the following:
- ✅ Public can view quiz list without authentication
- ✅ Authenticated users can take quizzes
- ✅ Admin can create/edit quizzes
- ✅ Users cannot access other users' data
- ✅ One-attempt-per-quiz restriction works

## 🔧 Rule Customization

### **Adding New Admin**
```javascript
// Add to admin collection in Firestore console
{
  email: "admin@example.com",
  createdAt: serverTimestamp(),
  createdBy: "existing-admin-uid"
}
```

### **Extending Quiz Validation**
```javascript
function isValidQuizData() {
  return request.resource.data.keys().hasAll([...]) &&
         // Add custom validation here
         request.resource.data.customField is string;
}
```

### **Custom Collection Rules**
```javascript
match /custom_collection/{docId} {
  allow read: if true; // Public read
  allow write: if isAdmin(); // Admin only write
}
```

## ⚠️ Important Notes

### **Admin Setup Required**
- **First Admin**: Must be added manually in Firestore console
- **Admin Collection**: Create `/admin/{email}` documents for each admin
- **Email Match**: Admin email must match Firebase Auth email

### **Security Best Practices**
- **Regular Audits**: Review rules periodically
- **Test Thoroughly**: Test all access scenarios before deploying
- **Monitor Usage**: Check Firestore usage and security alerts
- **Backup Rules**: Keep a backup of working rules before changes

### **Development vs Production**
- **Development**: Can use more permissive rules for testing
- **Production**: Always use strict rules as provided
- **Environment Variables**: Consider different rule sets per environment

## 📊 Testing the Rules

### **Test Scenarios**
1. **Unauthenticated User**:
   - ✅ Can view quiz list
   - ❌ Cannot submit quiz attempts
   - ❌ Cannot view user profiles

2. **Authenticated User**:
   - ✅ Can take quizzes (once per quiz)
   - ✅ Can view own attempts
   - ❌ Cannot view others' attempts
   - ❌ Cannot create quizzes

3. **Admin User**:
   - ✅ Can create/edit/delete quizzes
   - ✅ Can view all user data
   - ✅ Can manage content

### **Validation Tests**
- Invalid quiz data should be rejected
- Malformed question structure should fail
- Duplicate attempts should be prevented
- Unauthorized access should be denied

## 🚨 Troubleshooting

### **Common Issues**
1. **Permission Denied**: Check authentication and admin status
2. **Invalid Data**: Validate against required fields and formats
3. **Rules Not Applied**: Ensure rules are properly deployed
4. **Admin Access Issues**: Verify admin collection setup

### **Debug Tools**
- Firebase Console → Firestore → Rules Playground
- Browser DevTools → Network tab for request details
- Firebase SDK debug logs in application

The rules are now ready for deployment and provide comprehensive security for your quiz application! 🎉