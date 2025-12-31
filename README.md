<div align="center">

# 💬 RealTimeChat

### A Modern, Real-Time Chat Application

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

*Experience seamless real-time communication with a beautiful, intuitive interface*

**Built by [Dheeraj Gujarathi](https://github.com/dheerajgujarathi)**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Overview

RealTimeChat is a full-stack MERN application that enables instant messaging with real-time updates using WebSocket technology. Built with modern web technologies, it provides a smooth, responsive chat experience with user authentication, multiple chat rooms, and file sharing capabilities.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure authentication with JWT tokens
- **Password Encryption** - Bcrypt hashing for password security
- **Protected Routes** - Middleware-based route protection
- **Session Management** - Persistent user sessions

### 💬 Real-Time Messaging
- **Instant Message Delivery** - WebSocket-powered real-time communication
- **Multiple Chat Rooms** - Create and join different chat rooms
- **Online Status** - See who's currently online
- **Typing Indicators** - Real-time typing notifications
- **Message History** - Persistent message storage

### 📁 Media & Files
- **File Upload** - Share images and documents
- **Image Preview** - In-chat image display
- **Multi-format Support** - Support for various file types

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI** - Clean, intuitive interface
- **User Settings** - Customize profile and preferences
- **Chat Sidebar** - Easy navigation between rooms

## 🛠️ Tech Stack

### Frontend
```
⚛️  React 18.2.0          - UI Framework
🔀  React Router 6.20.0   - Client-side routing
📡  Axios 1.6.2           - HTTP client
🔌  Socket.io Client 4.6  - Real-time communication
```

### Backend
```
🟢  Node.js & Express     - Server framework
🍃  MongoDB & Mongoose    - Database & ODM
🔐  JWT & Bcrypt          - Authentication & encryption
⚡  Socket.io 4.6         - WebSocket server
📤  Multer                - File upload handling
✅  Express Validator     - Input validation
```

### Development Tools
```
🔄  Nodemon               - Auto-restart server
🔁  Concurrently          - Run multiple scripts
🌐  CORS                  - Cross-origin resource sharing
🔒  dotenv                - Environment variable management
```

## 📁 Project Structure

```
RealTimeChat/
│
├── 📂 client-manual/          # React Frontend Application
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/          # Login & Register components
│   │   │   ├── Chat/          # Chat interface components
│   │   │   ├── Common/        # Shared components (PrivateRoute)
│   │   │   └── Settings/      # User settings
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication state management
│   │   ├── utils/
│   │   │   ├── api.js         # Axios configuration
│   │   │   └── socket.js      # Socket.io client setup
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   └── package.json
│
└── 📂 server/                 # Node.js Backend Application
    ├── config/
    │   └── db.js              # MongoDB connection
    ├── controllers/
    │   ├── authController.js  # Authentication logic
    │   ├── messageController.js
    │   ├── roomController.js
    │   └── userController.js
    ├── middleware/
    │   └── auth.js            # JWT verification middleware
    ├── models/
    │   ├── User.js            # User schema
    │   ├── Room.js            # Chat room schema
    │   └── Message.js         # Message schema
    ├── routes/
    │   ├── auth.js            # Authentication routes
    │   ├── messages.js        # Message routes
    │   ├── rooms.js           # Room routes
    │   ├── users.js           # User routes
    │   └── upload.js          # File upload routes
    ├── socket/
    │   └── socketHandler.js   # WebSocket event handlers
    ├── uploads/               # User uploaded files
    ├── server.js              # Server entry point
    ├── package.json
    └── .env                   # Environment variables
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

### Installation

1️⃣ **Clone the repository**
```bash
git clone <your-repository-url>
cd RealTimeChat
```

2️⃣ **Install Backend Dependencies**
```bash
cd server
npm install
```

3️⃣ **Install Frontend Dependencies**
```bash
cd ../client-manual
npm install
```

### Configuration

4️⃣ **Set up Environment Variables**

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> ⚠️ **Important:** Change `JWT_SECRET` to a strong, unique secret in production!

### Database Setup

5️⃣ **Start MongoDB**

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### Running the Application

6️⃣ **Start the Backend Server**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

7️⃣ **Start the Frontend (in a new terminal)**
```bash
cd client-manual
npm start
```
Client will run on `http://localhost:3000`

8️⃣ **Run Both Concurrently (alternative)**
```bash
cd server
npm run dev:full
```

## 🎯 Usage

1. **Register** - Create a new account with username, email, and password
2. **Login** - Sign in with your credentials
3. **Join/Create Rooms** - Browse available chat rooms or create your own
4. **Start Chatting** - Send messages, share files, and see real-time updates
5. **Customize Settings** - Update your profile and preferences

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Message Endpoints

#### Get Room Messages
```http
GET /api/messages/room/:roomId
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "room123",
  "content": "Hello, world!"
}
```

### Room Endpoints

#### Get All Rooms
```http
GET /api/rooms
Authorization: Bearer <token>
```

#### Create Room
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "General Chat",
  "description": "A place for general discussion"
}
```

### File Upload

#### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
```

## 🔌 WebSocket Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server → Client
- `message` - New message received
- `user_joined` - User joined the room
- `user_left` - User left the room
- `typing` - Someone is typing
- `online_users` - List of online users

## 🔧 Configuration Options

### Server Configuration (`server/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/realtime-chat |
| `JWT_SECRET` | Secret key for JWT | - |
| `NODE_ENV` | Environment mode | development |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

### Client Configuration (`client-manual/package.json`)
```json
{
  "proxy": "http://localhost:5000"
}
```

## 📦 Build for Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client-manual
npm run build
```

The optimized build will be in the `client-manual/build` folder, ready for deployment.

## 🚢 Deployment

### Backend Deployment (Heroku example)
```bash
cd server
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=<your-mongodb-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
```

### Frontend Deployment (Vercel/Netlify)
- Build the frontend: `npm run build`
- Deploy the `build` folder
- Set environment variables in your hosting platform

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## �‍💻 Author

**Dheeraj Gujarathi**

Feel free to reach out for any queries or collaboration opportunities!

## �📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running locally or check your MongoDB Atlas connection string.

### CORS Errors
**Solution:** Verify `CLIENT_URL` in `.env` matches your frontend URL.

### Socket Connection Failed
**Solution:** Check that both frontend and backend are running and ports are correct.

## 📞 Support

If you have any questions or need help, please:
- Open an issue in the repository
- Contact the development team
- Check the documentation

---

<div align="center">

**Built with ❤️ by Dheeraj Gujarathi using the MERN Stack**

⭐ Star this repo if you find it helpful!

</div>
