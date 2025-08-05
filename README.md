<p align="center">
  <img src="frontend/public/logo.svg" alt="Notify Logo" width="120" />
</p>

<h1 align="center">
  Notify
</h1>

**Notify** is a real-time collaborative pinboard and note-taking application. It allows multiple users to join shared rooms, create and edit notes (pins) on a virtual board, and see each other's changes and presence live. Built with a modern React (Next.js) frontend and a FastAPI backend, Notify is ideal for brainstorming, remote collaboration, and visual note-taking.

---

## Features

- 📝 **Collaborative Pinboard:** Multiple users can join a room and add, move, edit, or delete notes (pins) in real time.
- 👥 **User Presence:** See who else is online in your room, with avatars and live cursor tracking.
- 🚀 **Instant Updates:** All changes are broadcast instantly via WebSockets.
- 🎨 **Modern UI:** Responsive and beautiful interface built with TailwindCSS and Shadcn UI.

---

## Project Structure

```
Notify/
├── backend/          # FastAPI backend (API, WebSocket, business logic)
│   ├── app.py
│   ├── requirements.txt
│   └── src/
│       ├── main.py
│       ├── router.py
│       └── controller/
│           └── room_controller.py
├── frontend/         # Next.js frontend (UI, logic, assets)
│   ├── package.json
│   ├── public/
│   │   └── logo.svg
│   └── src/
│       ├── app/
│       │   ├── layout.js
│       │   └── page.js
│       └── components/
│           ├── PinBoard.js
│           └── Pin.js
|           |__ UserList.js
└── README.md         # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js** (v20.9.0 recommended)
- **Python** (3.12.x recommended)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Notify
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# Activate the virtual environment:
# On Windows:
./venv/Scripts/activate
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt

# Run the backend server
python app.py || uvicorn app:app --reload
# The backend runs at http://localhost:8000
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Start the development server
npm run dev
# The frontend runs at http://localhost:3000
```

---

## Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Enter a username and either create a new room or join an existing one using a room ID.
3. Add, move, edit, or delete pins on the board. All changes are synced in real time with other users in the room.
4. See who is online and track their cursors and edits.

---

## Environment Variables

- **Backend:**
  - By default, CORS is enabled for `http://localhost:3000`.
  - You can customize allowed origins in `backend/src/main.py` if deploying elsewhere.
- **Frontend:**
  - The frontend expects the backend API at `http://localhost:8000`. Adjust API URLs in the code if you deploy elsewhere.

---

## Tech Stack

- **Frontend:** Next.js, Shadcn UI, TailwindCSS
- **Backend:** FastAPI

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements
- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
---

<p align="center">
  <img src="frontend/public/logo.svg" alt="Notify Logo" width="80" />
  <br/>
  <b>Happy Collaborating!</b>
</p>
