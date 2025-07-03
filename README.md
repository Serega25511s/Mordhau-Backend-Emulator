# Mordhau API Emulator

![Mordhau](https://cdn.cloudflare.steamstatic.com/steam/apps/629760/header.jpg)

## About the Project

**MordhauAPI Emulator** is a server API emulator for the game [Mordhau](https://store.steampowered.com/app/629760/MORDHAU/), allowing you to run your own backend and play without connecting to official servers. The project is intended for enthusiasts who want to restore or modify the server side of the game, as well as for local testing and development.

> ⚠️ **Attention:** This project is for educational and research purposes only. Use at your own risk.

---

## Features
- Emulation of main Mordhau API endpoints
- Storage of users, servers, matches, and inventory data in MongoDB
- Automatic creation of collections and TTL index for servers
- Flexible configuration via config file

---

## GameTool Utilities (Client & Server)

The `GameTool` folder contains utilities and configuration files for both the Mordhau client and dedicated server.

### Placement Instructions (Required Step)
**To use the emulator, you must place the GameTool utilities and configs in the correct directories:**
- **Server utilities and configs:**
  - Place all files from `GameTool/Server/` into your Mordhau Dedicated Server directory:
    - `Mordhau Dedicated Server\Mordhau\Binaries\Win64`
- **Client utilities and configs:**
  - Place all files from `GameTool/Client/` into your Mordhau client directory:
    - `Mordhau\Mordhau\Binaries\Win64`

### Configuration
- Both the client and server have their own configuration files located in the respective `GameTool/Client/` and `GameTool/Server/` folders.
- These configs allow you to set up connection parameters and other options for integration with the emulator backend.
- **Note:** To enable interaction with the official licensed API (so that licensed players can connect), set the `LicenseServer` parameter to `true` in the server config file.
- Make sure to review and adjust these configuration files as needed for your environment.

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/MordhauAPI.git
cd MordhauAPI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Install and run MongoDB
- [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Install and start MongoDB (by default at `mongodb://127.0.0.1:27017/`)
- Make sure the MongoDB service is running:
  ```bash
  mongod
  ```

### 4. Place GameTool utilities (REQUIRED)
- Follow the instructions in the [GameTool Utilities (Client & Server)](#gametool-utilities-client--server) section above to place the necessary files for both the client and server. This is a required step for the emulator to function correctly.

### 5. Configure the project
In the [`config.json`](./config.json) file, specify:
- `mongodbUri` — your MongoDB connection string
- `apiPort` — the port for the API server

**Example:**
```json
{
  "mongodbUri": "mongodb://127.0.0.1:27017/",
  "apiPort": 3111
}
```

### 6. Start the API server
```bash
npm start
```
or
```bash
node index.js
```

---

## Project Structure
- `db.js` — database initialization, auto-creation of collections and TTL index
- `server.js` — Fastify API server startup
- `Api/` — directory with endpoint implementations
- `config.json` — configuration file
- `GameTool/` — utilities and configs for Mordhau client and server integration

---

## Contribution & Feedback
Im welcome your PRs, bug reports, and suggestions! Open issues or create pull requests.

---

## License
This project is licensed under the MIT License. Not affiliated with Triternion or the official Mordhau servers.

---

**Enjoy your own Mordhau backend!** 
