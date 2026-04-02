# 🚀 SyncBoard - Real-time Project Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square&logo=react)
![Socket.io](https://img.shields.io/badge/Real--time-Socket.io-black?style=flat-square&logo=socket.io)
![Redis](https://img.shields.io/badge/Caching-Redis-red?style=flat-square&logo=redis)

## 📖 Overview
SyncBoard is a comprehensive, Jira-like project management platform designed to help teams collaborate effectively. It focuses on real-time data synchronization, robust role-based access control, and high performance for handling complex task workflows.

🔗 **Live Demo:** [https://project-bqqb9.vercel.app](https://project-bqqb9.vercel.app)
*(Note: Please allow 30-50 seconds for the initial load as the backend is hosted on a free Render instance).*

## ✨ Key Features
* **Real-time Collaboration:** Instant updates on task movements (Kanban board) across all active clients using `Socket.io`, eliminating data conflicts.
* **Role-Based Access Control (RBAC):** Strict authorization logic (Admin/Leader/Member) implemented via `JWT` and Express Middlewares.
* **Optimized Performance:** Drastically reduced API response times (from ~150ms to <10ms) for heavy dashboard queries using `Redis` caching strategies.
* **Smart Asset Management:** Offloaded static file and attachment storage to `Cloudinary` to preserve server bandwidth.
* **Security Guardrails:** Secured HTTP headers and prevented brute-force attacks using `Helmet` and `Express Rate Limit`.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Axios.
* **Backend:** Node.js, Express.js, Socket.io.
* **Database & Storage:** MongoDB (Atlas), Redis (Enterprise Cloud), Cloudinary.
* **Deployment:** Vercel (Frontend), Render (Backend).

## 🚀 Local Development Setup

To run this project locally, you will need Node.js, MongoDB, and Redis installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/nthghk0811/Project-Management-System.git
cd Project-Management-System

### 2\. ⚙️ Backend Setup

Open a new terminal, navigate to `/be`, and install the libraries:

```bash
cd be
npm install
```

Create a `.env` file in the `be` directory and fill in your security settings:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
REDIS_URL=your_redis_url
CLOUDINARY_URL=your_cloudinary_url
CLIENT_URL=http://localhost:5173
```

Run Backend server:

```bash
npm run dev
```

### 3\. 🎨 Frontend Setup

Open another terminal, return to the root directory, and then navigate to the frontend directory:

```bash
cd ../fe
npm install
```

Create a `.env` file in the `fe` directory to connect to the local backend:

```env
VITE_API_URL=http://localhost:8080
```

Run Frontend development server:

```bash
npm run dev
```

## 📸 Screenshots

## 👨‍💻 Author

**Nguyen Hoang Hai**

  * GitHub: [@nthghk0811](https://www.google.com/search?q=https://github.com/nthghk0811)

<!-- end list -->

```
```