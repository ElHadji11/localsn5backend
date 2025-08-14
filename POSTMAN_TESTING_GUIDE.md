# Postman Testing Guide for Backend Routes

This guide explains how to test your protected backend routes using Postman with Clerk authentication.

## Quick Start Guide

### Step 1: Setup Environment
1. **Environment Variables**: Ensure your `.env` file has the correct Clerk keys:
   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
   CLERK_SECRET_KEY=sk_test_your_secret_key
   ```

2. **Start Backend Server**: 
   ```bash
   cd backend
   npm start
   ```

### Step 2: Generate Test Token
Run the test script to create a test user and get a token:
```bash
cd backend
node test-auth.js
```

This will output a token you can use in Postman.

### Step 3: Test in Postman
1. Create a new request in Postman
2. Add the Authorization header: `Bearer YOUR_TOKEN_HERE`
3. Test the endpoints below

## Prerequisites

1. **Environment Variables**: Ensure your `.env` file has the correct Clerk keys:
   ```env
   CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
   CLERK_SECRET_KEY=sk_test_your_secret_key
   ```

2. **Backend Server**: Make sure your backend server is running on the correct port.

## Testing Public Routes

### 1. Test Public Route
- **Method**: GET
- **URL**: `http://localhost:5000/api/test/public`
- **Headers**: None required
- **Expected Response**: 
  ```json
  {
    "message": "This is a public route - no authentication required",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

## Testing Protected Routes

### Method 1: Using Clerk Session Token (Recommended)

#### Step 1: Get Session Token from Mobile App
1. Sign in to your mobile app
2. Open browser developer tools or use a tool to capture network requests
3. Look for requests to your backend API
4. Copy the `Authorization` header value (it should look like: `Bearer eyJ...`)

#### Step 2: Test Protected Route in Postman
- **Method**: GET
- **URL**: `http://localhost:5000/api/test/protected`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN_HERE
  Content-Type: application/json
  ```
- **Expected Response**:
  ```json
  {
    "message": "This is a protected route - authentication required",
    "userId": "user_2abc123def456",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

### Method 2: Using Clerk API Key (For Development)

#### Step 1: Create a Test User Token
You can create a test user token using Clerk's API or dashboard for development purposes.

#### Step 2: Test with User Token
- **Method**: GET
- **URL**: `http://localhost:5000/api/test/protected`
- **Headers**:
  ```
  Authorization: Bearer YOUR_USER_TOKEN_HERE
  Content-Type: application/json
  ```

## Testing Your Application Routes

### User Routes

#### 1. Get Current User (Protected)
- **Method**: GET
- **URL**: `http://localhost:5000/api/users`
- **Headers**: 
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```

#### 2. Sync User (Public)
- **Method**: POST
- **URL**: `http://localhost:5000/api/users/sync`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```

#### 3. Get User Profile (Public)
- **Method**: GET
- **URL**: `http://localhost:5000/api/users/profile/{userId}`
- **Headers**: None required

#### 4. Update User Profile (Protected)
- **Method**: PUT
- **URL**: `http://localhost:5000/api/users/profile`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "username": "new_username",
    "bio": "Updated bio"
  }
  ```

#### 5. Become Seller (Protected)
- **Method**: POST
- **URL**: `http://localhost:5000/api/users/become-seller`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "companyName": "My Company",
    "TypeActivite": "Technology",
    "tailleEntreprise": "10-50",
    "region": "Paris",
    "bio": "Company description"
  }
  ```

### Post Routes

#### 1. Get All Posts (Public)
- **Method**: GET
- **URL**: `http://localhost:5000/api/posts`
- **Headers**: None required

#### 2. Create Post (Protected)
- **Method**: POST
- **URL**: `http://localhost:5000/api/posts`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "title": "Test Post",
    "description": "This is a test post",
    "price": 100,
    "category": "Electronics"
  }
  ```

#### 3. Get Post by ID (Public)
- **Method**: GET
- **URL**: `http://localhost:5000/api/posts/{postId}`
- **Headers**: None required

#### 4. Update Post (Protected)
- **Method**: PUT
- **URL**: `http://localhost:5000/api/posts/{postId}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description"
  }
  ```

#### 5. Delete Post (Protected)
- **Method**: DELETE
- **URL**: `http://localhost:5000/api/posts/{postId}`
- **Headers**:
  ```
  Authorization: Bearer YOUR_SESSION_TOKEN
  ```

## Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized - you must be logged in",
  "error": "No user ID found in request"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden - insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Tips for Testing

1. **Save Environment Variables**: In Postman, create an environment and save your base URL and session token as variables.

2. **Use Collections**: Create a Postman collection for your API to organize your requests.

3. **Test Error Cases**: Always test both success and error scenarios.

4. **Check Headers**: Ensure you're sending the correct Content-Type and Authorization headers.

5. **Monitor Console**: Check your backend console for any errors or logs.

## Troubleshooting

### Issue: "Unauthorized - you must be logged in"
- **Solution**: Make sure you're including the Authorization header with a valid session token.

### Issue: "No user ID found in request"
- **Solution**: Your session token might be expired. Get a fresh token from your mobile app.

### Issue: CORS errors
- **Solution**: Ensure your backend CORS configuration allows requests from Postman.

### Issue: Server not responding
- **Solution**: Check if your backend server is running and accessible on the correct port.

## Development vs Production

- **Development**: Use test tokens and local URLs
- **Production**: Use real user tokens and production URLs
- **Environment Variables**: Use different Clerk keys for development and production

## Security Notes

1. **Never commit tokens**: Don't save real tokens in your code or documentation
2. **Use test accounts**: Create test users for development
3. **Rotate keys**: Regularly rotate your Clerk keys
4. **Monitor logs**: Keep an eye on authentication logs for suspicious activity
