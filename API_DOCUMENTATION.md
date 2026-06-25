# API Documentation - Social Media Backend

An academic-grade, MVC-structured backend API built with Node.js, Express, MongoDB (Mongoose), and JSON Web Tokens (JWT).

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a MongoDB Atlas URI

### Installation & Run
1. Navigate to the project folder:
   ```bash
   cd social-media-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/social-media-db
   JWT_SECRET=supersecretkey123
   ```
4. Run the server:
   * Production mode: `npm start`
   * Development mode: `npm run dev` (uses nodemon)

---

## 📂 MVC Folder Structure

```
social-media-backend/
├── config/
│   └── db.js                 # Database connection file
├── controllers/
│   ├── authController.js     # Handles registration and login authentication
│   ├── userController.js     # Handles User CRUD and social follow/unfollow
│   ├── postController.js     # Handles Post CRUD and likes
│   ├── commentController.js  # Handles Comment CRUD (linked to posts and users)
│   └── messageController.js  # Handles Message CRUD (direct private messages)
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── models/
│   ├── User.js               # User Model schema and helper hooks
│   ├── Post.js               # Post Model schema
│   ├── Comment.js            # Comment Model schema
│   └── Message.js            # Message Model schema
├── routes/
│   ├── authRoutes.js         # Routes mapping for authentication endpoints
│   ├── userRoutes.js         # Routes mapping for User CRUD endpoints
│   ├── postRoutes.js         # Routes mapping for Post CRUD endpoints
│   ├── commentRoutes.js      # Routes mapping for Comment CRUD endpoints
│   └── messageRoutes.js      # Routes mapping for Message CRUD endpoints
├── .env                      # Sensitive configuration variables (gitignored)
├── .env.example              # Sample environment template file
├── .gitignore                # Specifies intentionally untracked files to ignore
├── API_DOCUMENTATION.md      # API Reference and project manual (this file)
├── package.json              # Script definitions and package dependencies
└── server.js                 # Entry point of the Express server
```

---

## 🛡️ Authentication & Authorization

All routes marked as **[Protected]** require a valid JWT token. The token must be passed in the `Authorization` HTTP header with the `Bearer` prefix:
```http
Authorization: Bearer <your-jwt-token>
```

---

## 🔑 1. Authentication Endpoints

### Register User
* **Method**: `POST`
* **Route**: `/api/auth/register`
* **Access**: Public
* **Body** (JSON):
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "securepassword123",
    "bio": "Explorer and code craftsman"
  }
  ```
* **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "64bc8e83fdf40c11cc28f731",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "bio": "Explorer and code craftsman",
      "followers": [],
      "following": [],
      "createdAt": "2026-06-16T12:00:00.000Z"
    }
  }
  ```

### Login User
* **Method**: `POST`
* **Route**: `/api/auth/login`
* **Access**: Public
* **Body** (JSON):
  ```json
  {
    "email": "alex@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "64bc8e83fdf40c11cc28f731",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "bio": "Explorer and code craftsman",
        "followers": [],
        "following": []
      }
    }
  }
  ```

---

## 👤 2. User Endpoints

### Get All Users
* **Method**: `GET`
* **Route**: `/api/users`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "_id": "64bc8e83fdf40c11cc28f731",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "bio": "Explorer and code craftsman",
        "followers": [],
        "following": [],
        "createdAt": "2026-06-16T12:00:00.000Z"
      }
    ]
  }
  ```

### Get User Profile (Self)
* **Method**: `GET`
* **Route**: `/api/users/profile`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`): Retrieves details of the authenticated user.

### Update User Profile (Self)
* **Method**: `PUT`
* **Route**: `/api/users/profile`
* **Access**: **[Protected]**
* **Body** (JSON):
  ```json
  {
    "name": "Alex M. Mercer",
    "bio": "Senior Javascript engineer"
  }
  ```
* **Success Response** (`200 OK`)

### Get User by ID
* **Method**: `GET`
* **Route**: `/api/users/:id`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

### Update User by ID
* **Method**: `PUT`
* **Route**: `/api/users/:id`
* **Access**: **[Protected]** *(Only allowable by own user matching `:id`)*
* **Body** (JSON): Name, bio, or password can be updated.
* **Success Response** (`200 OK`)

### Delete User by ID
* **Method**: `DELETE`
* **Route**: `/api/users/:id`
* **Access**: **[Protected]** *(Only allowable by own user matching `:id`)*
* **Description**: Deletes user account and cascades by removing all user's posts, comments, messages, and unfollowing from other lists.
* **Success Response** (`200 OK`)

### Follow User
* **Method**: `POST`
* **Route**: `/api/users/:id/follow`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

### Unfollow User
* **Method**: `DELETE`
* **Route**: `/api/users/:id/follow`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

---

## 📝 3. Post Endpoints

### Create Post
* **Method**: `POST`
* **Route**: `/api/posts`
* **Access**: **[Protected]**
* **Body** (JSON):
  ```json
  {
    "caption": "Exploring Mongoose schemas! 🗄️"
  }
  ```
* **Success Response** (`210 Created`)

### Get All Posts
* **Method**: `GET`
* **Route**: `/api/posts`
* **Access**: Public / Protected
* **Success Response** (`200 OK`): Array of posts populated with author information, sorted newest first.

### Get Single Post
* **Method**: `GET`
* **Route**: `/api/posts/:id`
* **Access**: Public / Protected
* **Success Response** (`200 OK`)

### Update Post
* **Method**: `PUT`
* **Route**: `/api/posts/:id`
* **Access**: **[Protected]** *(Post owner only)*
* **Body** (JSON):
  ```json
  {
    "caption": "Mongoose schemas are amazing! 🗄️"
  }
  ```
* **Success Response** (`200 OK`)

### Delete Post
* **Method**: `DELETE`
* **Route**: `/api/posts/:id`
* **Access**: **[Protected]** *(Post owner only)*
* **Description**: Deletes the post and all comments written under this post.
* **Success Response** (`200 OK`)

### Like Post
* **Method**: `POST`
* **Route**: `/api/posts/:id/like`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

### Unlike Post
* **Method**: `DELETE`
* **Route**: `/api/posts/:id/like`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

---

## 💬 4. Comment Endpoints

### Add Comment to Post
* **Method**: `POST`
* **Route**: `/api/comments/:postId`
* **Access**: **[Protected]**
* **Body** (JSON):
  ```json
  {
    "text": "Splendid code layout!"
  }
  ```
* **Success Response** (`201 Created`)

### Get All Comments for a Post
* **Method**: `GET`
* **Route**: `/api/comments/:postId`
* **Access**: Public / Protected
* **Success Response** (`200 OK`)

### Get Single Comment by ID
* **Method**: `GET`
* **Route**: `/api/comments/comment/:id`
* **Access**: Public / Protected
* **Success Response** (`200 OK`)

### Update Comment
* **Method**: `PUT`
* **Route**: `/api/comments/:id`
* **Access**: **[Protected]** *(Comment owner only)*
* **Body** (JSON):
  ```json
  {
    "text": "Splendid code layout! Thanks for sharing."
  }
  ```
* **Success Response** (`200 OK`)

### Delete Comment
* **Method**: `DELETE`
* **Route**: `/api/comments/:id`
* **Access**: **[Protected]** *(Comment owner OR owner of the post can delete)*
* **Success Response** (`200 OK`)

---

## ✉️ 5. Message Endpoints

### Send Message
* **Method**: `POST`
* **Route**: `/api/messages`
* **Access**: **[Protected]**
* **Body** (JSON):
  ```json
  {
    "recipientId": "64bc8f15fdf40c11cc28f73f",
    "content": "Hey Alex! Would you like to review the MVC specs?"
  }
  ```
* **Success Response** (`201 Created`)

### Get User Messages (All Sent/Received Inbox)
* **Method**: `GET`
* **Route**: `/api/messages`
* **Access**: **[Protected]**
* **Success Response** (`200 OK`)

### Get Conversation History with User
* **Method**: `GET`
* **Route**: `/api/messages/conversation/:userId`
* **Access**: **[Protected]**
* **Description**: Returns all direct messages exchanged between the logged-in user and target user, sorted chronologically.
* **Success Response** (`200 OK`)

### Get Message Details
* **Method**: `GET`
* **Route**: `/api/messages/:id`
* **Access**: **[Protected]** *(Only sender or recipient can access)*
* **Success Response** (`200 OK`)

### Update Message
* **Method**: `PUT`
* **Route**: `/api/messages/:id`
* **Access**: **[Protected]** *(Only sender can edit message)*
* **Body** (JSON):
  ```json
  {
    "content": "Hey Alex! Let's check the MVC specs together."
  }
  ```
* **Success Response** (`200 OK`)

### Delete Message
* **Method**: `DELETE`
* **Route**: `/api/messages/:id`
* **Access**: **[Protected]** *(Sender or recipient can delete)*
* **Success Response** (`200 OK`)
