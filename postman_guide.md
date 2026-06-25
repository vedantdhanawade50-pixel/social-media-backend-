# Postman Testing Guide - Social Media Backend API

This guide provides the necessary details to test the Social Media Backend APIs using Postman (or any other REST client).

## Base URL
All API requests are prefixed with:
`http://localhost:5000`

---

## 1. Authentication APIs

### A. Register User
Creates a new user account.
* **Method**: `POST`
* **URL**: `/api/auth/register`
* **Headers**: `Content-Type: application/json`
* **Request Body** (JSON):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "bio": "Software developer and coffee lover"
}
```
* **Expected Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "64bc8e83fdf40c11cc28f731",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "Software developer and coffee lover",
    "followers": [],
    "following": [],
    "createdAt": "2026-06-15T12:00:00.000Z"
  }
}
```

### B. Login User
Authenticates user and returns a JSON Web Token (JWT).
* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Request Body** (JSON):
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YmM4ZTgzZmRmNDBjMTFjYzI4ZjczMSIs...",
    "user": {
      "_id": "64bc8e83fdf40c11cc28f731",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "bio": "Software developer and coffee lover",
      "followers": [],
      "following": []
    }
  }
}
```

---

## 2. User Profile & Social APIs

> [!NOTE]
> All endpoints below require a valid JWT token. 
> In Postman, go to the **Authorization** tab, select **Bearer Token**, and paste the token from the Login response.

### A. Get Logged-In User Profile
Retrieves detailed information of the authenticated user.
* **Method**: `GET`
* **URL**: `/api/users/profile`
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "64bc8e83fdf40c11cc28f731",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "Software developer and coffee lover",
    "followers": [],
    "following": [],
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:00:00.000Z"
  }
}
```

### B. Update Logged-In User Profile
Updates the name and/or bio of the user.
* **Method**: `PUT`
* **URL**: `/api/users/profile`
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body** (JSON):
```json
{
  "name": "Jane D. Watson",
  "bio": "Exploring Node.js and building cool APIs"
}
```
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64bc8e83fdf40c11cc28f731",
    "name": "Jane D. Watson",
    "email": "jane@example.com",
    "bio": "Exploring Node.js and building cool APIs",
    "followers": [],
    "following": [],
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:05:00.000Z"
  }
}
```

### C. Follow User
Follows another user specified by their User ID.
* **Method**: `POST`
* **URL**: `/api/users/:id/follow` (Replace `:id` with another user's ID, e.g., `64bc8f15fdf40c11cc28f73f`)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully followed John Smith",
  "data": {
    "following": [
      "64bc8f15fdf40c11cc28f73f"
    ]
  }
}
```

### D. Unfollow User
Unfollows another user specified by their User ID.
* **Method**: `DELETE`
* **URL**: `/api/users/:id/follow` (Replace `:id` with target user's ID)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully unfollowed John Smith",
  "data": {
    "following": []
  }
}
```

---

## 3. Post APIs

### A. Create Post
Creates a new post for the logged-in user.
* **Method**: `POST`
* **URL**: `/api/posts`
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body** (JSON):
```json
{
  "caption": "My first post on this amazing platform! 🚀"
}
```
* **Expected Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64bc9a12fdf40c11cc28f74a",
    "caption": "My first post on this amazing platform! 🚀",
    "user": {
      "_id": "64bc8e83fdf40c11cc28f731",
      "name": "Jane D. Watson"
    },
    "likes": [],
    "createdAt": "2026-06-15T12:10:00.000Z",
    "updatedAt": "2026-06-15T12:10:00.000Z"
  }
}
```

### B. Get All Posts
Retrieves all posts on the platform (sorted by newest first, populated with author names).
* **Method**: `GET`
* **URL**: `/api/posts`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": [
    {
      "_id": "64bc9a12fdf40c11cc28f74a",
      "caption": "My first post on this amazing platform! 🚀",
      "user": {
        "_id": "64bc8e83fdf40c11cc28f731",
        "name": "Jane D. Watson"
      },
      "likes": [],
      "createdAt": "2026-06-15T12:10:00.000Z",
      "updatedAt": "2026-06-15T12:10:00.000Z"
    }
  ]
}
```

### C. Get Single Post
Retrieves a specific post by its ID.
* **Method**: `GET`
* **URL**: `/api/posts/:id` (Replace `:id` with a post ID, e.g., `64bc9a12fdf40c11cc28f74a`)
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Post retrieved successfully",
  "data": {
    "_id": "64bc9a12fdf40c11cc28f74a",
    "caption": "My first post on this amazing platform! 🚀",
    "user": {
      "_id": "64bc8e83fdf40c11cc28f731",
      "name": "Jane D. Watson"
    },
    "likes": [],
    "createdAt": "2026-06-15T12:10:00.000Z",
    "updatedAt": "2026-06-15T12:10:00.000Z"
  }
}
```

### D. Like Post
Likes a post.
* **Method**: `POST`
* **URL**: `/api/posts/:id/like` (Replace `:id` with post ID)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "likes": [
      "64bc8e83fdf40c11cc28f731"
    ]
  }
}
```

### E. Unlike Post
Removes a like from a post.
* **Method**: `DELETE`
* **URL**: `/api/posts/:id/like` (Replace `:id` with post ID)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {
    "likes": []
  }
}
```

### F. Delete Post
Deletes a post (only allowable by the owner).
* **Method**: `DELETE`
* **URL**: `/api/posts/:id` (Replace `:id` with post ID)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Post and associated comments deleted successfully",
  "data": null
}
```

---

## 4. Comment APIs

### A. Add Comment
Creates a new comment on a post.
* **Method**: `POST`
* **URL**: `/api/comments/:postId` (Replace `:postId` with post ID)
* **Headers**:
  * `Authorization`: `Bearer <YOUR_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body** (JSON):
```json
{
  "text": "Great post! Keep it up."
}
```
* **Expected Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "64bc9e8bfdf40c11cc28f755",
    "text": "Great post! Keep it up.",
    "user": {
      "_id": "64bc8e83fdf40c11cc28f731",
      "name": "Jane D. Watson"
    },
    "post": "64bc9a12fdf40c11cc28f74a",
    "createdAt": "2026-06-15T12:15:00.000Z",
    "updatedAt": "2026-06-15T12:15:00.000Z"
  }
}
```

### B. Get Comments for a Post
Gets all comments left on a post.
* **Method**: `GET`
* **URL**: `/api/comments/:postId` (Replace `:postId` with post ID)
* **Expected Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "_id": "64bc9e8bfdf40c11cc28f755",
      "text": "Great post! Keep it up.",
      "user": {
        "_id": "64bc8e83fdf40c11cc28f731",
        "name": "Jane D. Watson"
      },
      "post": "64bc9a12fdf40c11cc28f74a",
      "createdAt": "2026-06-15T12:15:00.000Z",
      "updatedAt": "2026-06-15T12:15:00.000Z"
    }
  ]
}
```

---

## 5. Sample Error Responses

### Missing/Invalid Token (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Not authorized, no token provided",
  "data": null
}
```

### Validation Error / Duplicate Resource (`400 Bad Request`):
```json
{
  "success": false,
  "message": "User already exists with this email",
  "data": null
}
```

### Resource Not Found (`404 Not Found`):
```json
{
  "success": false,
  "message": "Post not found",
  "data": null
}
```
