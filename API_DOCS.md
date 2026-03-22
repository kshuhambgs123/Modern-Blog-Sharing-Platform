# 🌐 Inkwell API Documentation

This document provides an overview of the RESTful API endpoints used in the Inkwell MERN Blog platform.

**Base URL**: `http://localhost:5000/api`

---

## 🔐 Auth Endpoints (`/auth`)

*   **POST** `/auth/register`
    *   **Body**: `{ "username", "email", "password" }`
    *   **Description**: Registers a new user.
*   **POST** `/auth/login`
    *   **Body**: `{ "email", "password" }`
    *   **Description**: Authenticates a user and returns their info in a JWT cookie.
*   **POST** `/auth/logout`
    *   **Description**: Clears the authentication token cookie.
*   **GET** `/auth/refetch`
    *   **Description**: Verifies the current session and restores the user's data.

---

## 📝 Post Endpoints (`/posts`)

*   **GET** `/posts`
    *   **Query**: `search`, `category`, `username`, `page`
    *   **Description**: Returns a paginated list of posts with optional filtering.
*   **GET** `/posts/:id`
    *   **Description**: Returns a single post by its ID and increments the view count.
*   **POST** `/posts`
    *   **Auth**: Required
    *   **Body**: `{ "title", "content", "photo", "categories", "tags" }`
    *   **Description**: Creates a new blog post.
*   **PUT** `/posts/:id`
    *   **Auth**: Required (Owner only)
    *   **Body**: `{ title, content, ... }`
    *   **Description**: Updates an existing blog post.
*   **DELETE** `/posts/:id`
    *   **Auth**: Required (Owner only)
    *   **Description**: Deletes a post, its featured image, and all associated comments.
*   **POST** `/posts/upload`
    *   **Auth**: Required
    *   **Body**: `file` (Multipart/form-data)
    *   **Description**: Uploads an image and returns the file URL.

---

## 💬 Comment Endpoints (`/comments`)

*   **GET** `/comments/post/:postId`
    *   **Description**: Returns a flat list of all comments for a specific post.
*   **POST** `/comments`
    *   **Auth**: Required
    *   **Body**: `{ "postId", "content", "parentId" (optional) }`
    *   **Description**: Adds a comment or a nested reply (Maximum depth: 5 levels).
*   **PUT** `/comments/:id/like`
    *   **Auth**: Required
    *   **Description**: Toggles a "Like" on a comment.
*   **DELETE** `/comments/:id`
    *   **Auth**: Required (Owner only)
    *   **Description**: Deletes a comment and all its nested replies.

---

## 👤 User Endpoints (`/users`)

*   **GET** `/users/:id`
    *   **Description**: Returns a user's public profile data (excluding password).
*   **PUT** `/users/:id`
    *   **Auth**: Required (Self only)
    *   **Body**: `{ "username", "bio", "profilePic", "password" }`
    *   **Description**: Updates user profile information.
*   **GET** `/users/:id/posts`
    *   **Description**: Returns all blog posts authored by a specific user.
*   **GET** `/users/:id/bookmarks`
    *   **Auth**: Required (Self only)
    *   **Description**: Returns the user's list of bookmarked posts.
*   **PUT** `/users/:id/bookmark/:postId`
    *   **Auth**: Required (Self only)
    *   **Description**: Toggles a bookmark for a post.

---

## 🛠️ Global Response Structure

**Success**: `200 OK` or `201 Created`
**Error**:
```json
{
  "message": "Error details here"
}
```

## 🏗️ Middlewares

*   **verifyToken**: Validates the JWT from the `token` cookie. Decodes and attaches `userId` and `username` to the request object.
*   **multer**: Handles multi-part file uploads with path sanitization and directory creation.
