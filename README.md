# 🚨 HostelSOS — Hostel Emergency Help & Rapid Response Management System

<p align="center">
  <a href="https://hostelsos-seven.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/LIVE_DEMO-hostelsos--seven.vercel.app-success?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <br/><br/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

> **Live Website:** [https://hostelsos-seven.vercel.app](https://hostelsos-seven.vercel.app)
> 
> A production-quality platform where hostel students can raise an emergency in one tap, and wardens, security, medical & maintenance staff can respond, track and resolve it in real time.


---

## 🌟 Features

### For Students
- **Hold-to-Activate SOS Button** — Press & hold 3 seconds to trigger
- **7 Emergency Categories** — Medical, Fire, Security, Mental Health, Maintenance, Harassment, Other
- **Discreet / Silent Mode** — No sound/vibration for sensitive situations
- **Location Tagging** — Attach room number & GPS coordinates
- **Real-time Chat** — Live messaging with assigned responders
- **My Incidents** — Track status of all your past emergencies

### For Staff (Warden / Security / Medical / Maintenance)
- **Kanban Board** — Drag incidents from Pending → Active → Resolved
- **Shift Status Toggle** — Mark yourself On Duty / Off Duty
- **Real-time Alerts** — Sound + toast notifications for new SOS
- **Filters & Search** — By category, priority, block, assigned responder
- **CSV Export** — Download incident reports

### For Admins
- **Analytics Dashboard** — SLA KPIs, response time charts, peak heatmap
- **Panic Broadcast** — Send campus-wide emergency alerts
- **Evacuation Monitor** — Headcount tracking by block
- **Staff Roster** — Manage roles, on-duty status
- **SLA Configuration** — Set response time targets per category

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend | Node.js, Express, Socket.IO |
| Database | In-memory DataStore (MongoDB-compatible, no setup needed) |
| Auth | JWT (access + refresh tokens), bcrypt, RBAC |
| Icons | Lucide React |
| Charts | Recharts |
| API Docs | OpenAPI 3.0 (`openapi.yaml`) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/shamvelayutham541-sketch/Hostel-Emergency.git
cd Hostel-Emergency

# Install all dependencies (root + client + server)
npm install

# Start both servers concurrently
npm run dev
```

The app will open at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/v1

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 👨‍🎓 Student | `student1@hostel.edu` | `Pass@1234` |
| 🏠 Warden | `warden1@hostel.edu` | `Pass@1234` |
| 🛡️ Security | `security1@hostel.edu` | `Pass@1234` |
| 🏥 Medical | `medical1@hostel.edu` | `Pass@1234` |
| 🔧 Maintenance | `maint1@hostel.edu` | `Pass@1234` |
| ⚙️ Admin | `admin@hostel.edu` | `Pass@1234` |

> 💡 Use the **1-Click Demo Login** buttons on the login page — no typing needed!

---

## 📁 Project Structure

```
Hostel-Emergency/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # SOSButton, IncidentModal, Navbar…
│       ├── pages/             # Landing, Login, Student/Staff/Admin
│       ├── services/          # API client, Socket.IO
│       └── store/             # Zustand state management
├── server/                    # Node.js backend
│   └── src/
│       ├── controllers/       # Auth, Incident, Analytics…
│       ├── models/            # In-memory DataStore
│       ├── routes/v1/         # REST API endpoints
│       ├── services/          # Escalation watchdog, adapters
│       └── sockets/           # Socket.IO handlers
├── openapi.yaml               # API documentation
└── package.json               # Root monorepo scripts
```

---

## 📡 API Documentation

Full REST API is documented in [`openapi.yaml`](./openapi.yaml). Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login, returns JWT |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/incidents` | Raise new SOS |
| `GET` | `/api/v1/incidents` | List incidents (filtered) |
| `PATCH` | `/api/v1/incidents/:id/status` | Update incident status |
| `GET` | `/api/v1/analytics/summary` | Analytics & SLA data |
| `POST` | `/api/v1/broadcasts` | Send campus alert |

---

## 🤝 Roles & Permissions

| Feature | Student | Warden | Security | Medical | Maintenance | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Raise SOS | ✅ | | | | | |
| View own incidents | ✅ | | | | | |
| View all incidents | | ✅ | ✅ | ✅ | ✅ | ✅ |
| Respond to incidents | | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | | | | | | ✅ |
| Manage staff | | | | | | ✅ |
| Panic broadcast | | ✅ | ✅ | | | ✅ |

---

## 📄 License

MIT © 2024 shamvelayutham541-sketch
