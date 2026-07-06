# sdcHouse 🏠

sdcHouse is a real-time, interactive virtual space where users can join, move around, and communicate with each other. It features real-time avatar movement, global text chat, and WebRTC-based peer-to-peer communication for private interactions.

## 🌟 Features

- **Real-time Avatar Movement:** Smooth, synchronized movement across all connected clients.
- **Global Chat:** Real-time text chat using Socket.IO.
- **Private Audio/Video Communication:** WebRTC integration for peer-to-peer (P2P) connections between users.
- **Avatar Customization:** Users can select different avatars and usernames upon joining.
- **Interactive UI:** Built with Next.js and styled with Tailwind CSS for a modern, responsive experience.

## 🏗️ Architecture

The application follows a standard Client-Server architecture with peer-to-peer capabilities for media streaming.

- **Client:** A Next.js application that renders the UI, handles user input, and manages WebRTC connections.
- **Server:** A Node.js/Express server that acts as a signaling server for WebRTC and manages the global state (player positions, chat) using Socket.IO.

```mermaid
graph TD
    subgraph Client [Client-side (Next.js)]
        UI[User Interface / React]
        RTC[WebRTC PeerConnection]
        SockC[Socket.IO Client]
    end

    subgraph Server [Server-side (Node.js)]
        Express[Express.js]
        SockS[Socket.IO Server]
        State[(In-Memory State / Players)]
    end
    
    %% Connections
    UI <--> |Interactions| SockC
    UI <--> |Media Streams| RTC
    
    SockC <--> |WebSocket: Movement, Chat, Signaling| SockS
    SockS <--> |Read/Write| State
    
    RTC <-.-> |P2P: Audio/Video/Data| RTC2[Other Clients' WebRTC]
```

## 🛠️ Technology Stack

**Frontend (Client):**
- [Next.js](https://nextjs.org/) (React Framework)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [Socket.IO Client](https://socket.io/) (Real-time events)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend (Server):**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/) (WebSocket Server)
- WebRTC (Handled via Socket.IO signaling)

---

## 🚀 Getting Started (Local Development)

To run this project locally, you will need to start both the server and the client.

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd sdcHouse
```

### 2. Setup the Server

The server handles Socket.IO connections and WebRTC signaling.

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Start the server (Runs on port 3001 by default)
npm start
```

### 3. Setup the Client

The client is the Next.js frontend. Open a **new terminal window/tab** and run:

```bash
# Navigate to the client directory from the project root
cd client

# Install dependencies
npm install

# Start the development server (Runs on port 3000 by default)
npm run dev
```

### 4. Open the Application
Once both servers are running, open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

You can open multiple tabs or different browsers to test the real-time multiplayer functionality and chat!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
