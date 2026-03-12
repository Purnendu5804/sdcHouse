# 🌐 sdcHouse: Proximity-Based Virtual Space

**sdcHouse** is a "metaverse-lite" platform built for the Software Development Club at VIT Bhopal. It enables real-time interaction through a 2D spatial environment where users move as avatars and communicate via **Peer-to-Peer (P2P) proximity-based voice chat**.

## 🚀 Core Features
* **Spatial Audio Engine:** Hand-rolled WebRTC implementation that triggers voice connections based on user proximity.
* **Real-time Synchronization:** Low-latency position tracking and state management using **Socket.io**.
* **Two-Tier Architecture:** Optimized deployment using Next.js on Vercel and a persistent Node.js/WebSocket backend on Render.
* **Modular React Design:** Logic segregated into custom hooks (`useGame`, `useWebRTC`) for high maintainability and performance.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, Socket.io |
| **Real-time Comms** | WebRTC (Native MediaDevices API), STUN Servers |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Technical Architecture

The project follows a clean separation of concerns:
* **Physics Engine (`useGame.ts`)**: Manages local and remote player states, collision detection, and movement broadcasting.
* **Audio Engine (`useWebRTC.ts`)**: Manages hardware permissions, signaling (Offer/Answer/ICE), and dynamic connections based on Euclidean distance.
* **Signaling Server**: Orchestrates the initial WebRTC handshake and global state updates.

---

## 💻 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sdcHouse.git
cd sdcHouse
```

### 2. Backend Setup (Server)

The backend handles WebSocket signaling and global state updates.

```bash
cd server
npm install
```

**Configuration:** The server uses `process.env.PORT` for production and defaults to `3001` for local development.

**Run:**
```bash
npm start
```

### 3. Frontend Setup (Client)

The frontend manages the UI, game logic, and WebRTC media streams.

```bash
cd ../client
npm install
```

**Environment Variables:** Create a `.env.local` file in the client folder:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Run:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to enter the house.