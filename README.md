# 🎥 MeetFlow — Real-Time Video Conferencing & Recording Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Signaling-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

MeetFlow is a full-stack, real-time video conferencing application inspired by Zoom and Google Meet. Built from scratch without third-party video SDK wrappers, MeetFlow leverages native **WebRTC** for low-latency peer-to-peer audio/video streaming, **Socket.io** for real-time signaling and chat, and **Cloudinary** for in-meeting recording storage and on-demand cloud playback.

---

## 🌟 Key Features

- **Peer-to-Peer Video & Audio**: Real-time multi-user mesh communication powered by WebRTC and STUN servers.
- **Real-Time Signaling & Chat**: Socket.io-driven SDP offer/answer exchanges, ICE candidate handling, and in-room instant messaging.
- **Pre-Meeting Lobby**: Preview camera, toggle audio/video inputs, and verify device permissions before joining.
- **Screen Sharing**: Effortlessly present screens or application windows during calls.
- **Session Recording & Cloud Upload**: Capture meetings natively via the browser's `MediaRecorder` API and stream recordings to Cloudinary.
- **Interactive Dashboard**:
  - **Activity & History**: Track past meetings and timestamps.
  - **Scheduled Calls**: Plan future calls and create persistent meeting links.
  - **Recordings Vault**: Stream and manage saved meeting recordings directly from the cloud.
- **Secure Authentication**: User sign-up, login, and protected routes using bcrypt and token authentication.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 (Vite / React Scripts)
- **UI & Styling**: Material-UI (MUI), Emotion, Custom CSS Design System (`MeetFlow_DesignSystem.css`)
- **Networking**: `socket.io-client`, `axios`
- **Media**: Native Browser WebRTC (`RTCPeerConnection`), `MediaRecorder` API

### Backend
- **Runtime & Server**: Node.js, Express 5
- **Signaling Server**: Socket.io
- **Database & ODM**: MongoDB with Mongoose
- **Cloud Media Storage**: Cloudinary SDK & Multer
- **Security**: bcrypt, CORS, Dotenv

---

## 📂 Project Structure

```text
ZOOM CLONE/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js        # Cloudinary SDK credentials & setup
│   │   ├── controllers/
│   │   │   ├── meetingController.js   # Meeting history & activity logic
│   │   │   ├── recordingController.js # Multer & Cloudinary video upload
│   │   │   ├── socketManager.js       # WebRTC signaling & in-meeting chat
│   │   │   └── userController.js      # Auth (Register / Login)
│   │   ├── models/
│   │   │   ├── meetingModel.js        # Schema for meetings and logs
│   │   │   ├── recordingModel.js      # Schema for cloud recording references
│   │   │   └── userModel.js           # User schema & credentials
│   │   ├── routes/
│   │   │   └── userRoutes.js          # REST endpoints
│   │   └── app.js                     # Express server & socket initialization
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── environment.js         # API & Socket endpoint config
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Global user authentication state
│   │   ├── pages/
│   │   │   ├── auth/                  # Login & registration forms
│   │   │   ├── home/                  # Dashboard, History, Scheduled, & Recordings
│   │   │   ├── landing/               # Hero landing page
│   │   │   ├── lobby/                 # Pre-call device preview
│   │   │   └── meet/                  # Video conference room, controls, chat & WebRTC
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Cloudinary Account](https://cloudinary.com/) (For storing meeting recordings)

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will start on `http://localhost:8000`.*

---

### 3. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check API Environment (`frontend/src/config/environment.js`):
   Ensure `IS_PROD` is set appropriately for local development or production:
   ```javascript
   let IS_PROD = false;
   export const server = IS_PROD ? "https://meetflow-aosr.onrender.com" : "http://localhost:8000";
   ```

4. Start the frontend application:
   ```bash
   npm start
   ```
   *The client application will run at `http://localhost:3000`.*

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/users/register` | Register a new user |
| `POST` | `/api/users/login` | Authenticate user & receive token |
| `POST` | `/api/users/add_to_activity` | Log user attendance in a meeting |
| `GET` | `/api/users/get_all_activity` | Fetch user meeting history |
| `GET` | `/api/users/get_meeting_info/:id` | Get metadata for a specific meeting |
| `DELETE`| `/api/users/delete_activity` | Remove meeting entry from history |
| `POST` | `/api/users/upload_recording` | Upload recorded meeting blob to Cloudinary |
| `GET` | `/api/users/get_recordings` | Retrieve user's cloud video recordings |
| `DELETE`| `/api/users/delete_recording/:id` | Delete saved recording from cloud & DB |

---

## 🔄 WebRTC Signaling Workflow

```text
[ Peer A ]                                 [ Signaling Server (Socket.io) ]                                 [ Peer B ]
    │                                                     │                                                     │
    ├─────────── 1. join-call (Room ID) ─────────────────>│                                                     │
    │                                                     ├─────────── 2. user-joined notification ────────────>│
    │                                                     │                                                     │
    ├─────────── 3. createOffer (SDP) ───────────────────>│                                                     │
    │                                                     ├─────────── 4. forward offer (SDP) ─────────────────>│
    │                                                     │<────────── 5. createAnswer (SDP) ───────────────────┤
    │<────────── 6. forward answer (SDP) ─────────────────┤                                                     │
    │                                                     │                                                     │
    ├─────────── 7. ICE Candidate Exchange ──────────────>│<────────── 7. ICE Candidate Exchange ──────────────┤
    │                                                     │                                                     │
    │◄═══════════════════════ Direct WebRTC Media Stream (Audio/Video/Screen) ═════════════════════════════════►│
```

---

## 🛡️ License
This project is licensed under the ISC License.
