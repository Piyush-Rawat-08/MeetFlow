# MeetFlow — Frontend Client

This directory contains the React 19 frontend application for **MeetFlow**, a real-time WebRTC video conferencing platform.

For full project architecture, backend configuration, and deployment guides, please see the [Main Project README](../README.md).

---

## 💻 Tech Stack

- **Framework**: React 19 (React Scripts / Vite)
- **Component Library**: Material-UI (MUI v9) & Emotion
- **Routing**: React Router DOM (v7)
- **Real-Time Client**: Socket.io Client
- **HTTP Client**: Axios
- **Design System**: Custom responsive design system (`src/styles/MeetFlow_DesignSystem.css`)

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure backend URL in `src/config/environment.js`:
   ```javascript
   let IS_PROD = false; // Set to true for live server, false for localhost
   export const server = IS_PROD ? "https://meetflow-aosr.onrender.com" : "http://localhost:8000";
   ```

3. Start the application:
   ```bash
   npm start
   ```

---

## 📁 Key Directories

- `src/pages/meet/`: Core video conference interface, controls, video grid, and in-room chat.
- `src/pages/meet/features/webrtc/`: WebRTC peer connection management, media streams, and ICE configuration.
- `src/pages/meet/features/recording/`: In-browser screen and audio recording (`MediaRecorder` API).
- `src/pages/lobby/`: Pre-meeting device check (camera, microphone, and room preview).
- `src/pages/home/`: User dashboard, past meetings activity, scheduled sessions, and recorded video archives.
- `src/context/AuthContext.jsx`: Authentication context and session state.
