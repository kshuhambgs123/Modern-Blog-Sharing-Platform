# 🖋️ Inkwell: Modern MERN Blog-Sharing Platform

Inkwell is a dynamic blog-sharing ecosystem featuring secure authentication, a high-performance MERN backend, and a premium React-driven UI. Built as a full-stack developer assignment.

---

## 🚀 Quick Start (Choose ONE)

### **Method A: 🐳 The "No Issue" Way (Docker)**  
Recommended for reviewers - no installation of Node or MongoDB required locally.
1.  **Open [Docker Desktop](https://www.docker.com/products/docker-desktop/)** or ensure Docker daemon is running.
2.  **On Mac/Linux, run**:  
    ```bash
    ./run_docker.sh
    ```
3.  **Access the app**:
    *   **Frontend**: [http://localhost:5173](http://localhost:5173)
    *   **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

### **Method B: 💻 Standard Way (Local Setup)**  
1.  **Ensure Node.js v18+ and MongoDB** (running on port 27017) are installed.
2.  **Initialize all dependencies**:
    ```bash
    npm run install-all
    ```
3.  **Run the local launcher**:
    ```bash
    ./run.sh
    ```

---

## 🛠️ Key Technical Features
*   **Secure Auth Flow**: JWT stored in `HttpOnly` cookies, bcrypt password hashing, and session persistence.
*   **Deep Nested Discussions**: Custom recursive commenting engine with a **strict 5-level depth cap** to prevent UI breaking.
*   **Keyword Discovery**: Multi-field search (title, body, tags) with category filtering and author-specific listings.
*   **Professional UI**: Glassmorphic dark theme, responsive layouts, animated transitions, and toast notifications.
*   **Cloud Ready**: Easily switch to MongoDB Atlas by modifying `backend/.env`.

---

## 📂 Project Structure
```text
├── backend/            # Express Server, Mongoose Models & Routes
├── frontend/           # Vite + React (Source), Pages & Components
├── docker-compose.yml  # Full-stack container orchestration
├── run_docker.sh       # Indestructible Docker launcher (handles port conflicts)
├── run.sh              # Unified local dev launcher
├── API_DOCS.md         # Full REST endpoint reference
└── README.md           # This guide
```

---

## 🚥 Prerequisites & Troubleshooting

### **Local Prerequisites**:
*   **Node.js**: v18 or higher (Node 20+ recommended).
*   **MongoDB**: Local installation running on default port `27017`.
*   **Browser**: Modern Chrome/Safari/Firefox.

### **Common Troubleshooting**:
*   **Port Conflict**: My scripts (`run.sh` & `run_docker.sh`) automatically detect and kill any processes on port 5000/5173 to ensure a clean start.
*   **MongoDB Atlas (Cloud)**: If you'd rather not install MongoDB locally, just replace the `MONGO_URI` in `backend/.env` with your cloud cluster URL.

---
Built to demonstrate modern full-stack engineering practices. 🎨
