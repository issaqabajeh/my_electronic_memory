# My Electronic Memory — Frontend

React web application for the Alzheimer's patient care platform.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Styling |
| React Router | v6 | Client-side routing |
| Axios | 1.7 | HTTP requests to backend API |
| Leaflet.js + React Leaflet | 1.9 / 4.2 | Interactive GPS maps |
| React Hot Toast | 2.4 | Toast notifications |
| Lucide React | 0.383 | Icon library |
| date-fns | 3.6 | Date formatting |
| Google Fonts | — | DM Sans + Playfair Display |

---

## Prerequisites

- Node.js 18 or higher
- Backend running at `http://localhost:8000`

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

App runs at: **http://localhost:5173**

To build for production:
```bash
npm run build
```

---

## Required Config Files

All four files must exist in the `mem-frontend/` root folder.

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Electronic Memory</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**vite.config.js**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

**tailwind.config.js**
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      }
    }
  },
  plugins: [],
}
```

**postcss.config.js**
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

---

## Project Structure

```
mem-frontend/
├── index.html                              # Vite HTML entry point
├── vite.config.js                          # Vite configuration
├── tailwind.config.js                      # Tailwind CSS configuration
├── postcss.config.js                       # PostCSS configuration
├── package.json                            # Dependencies
└── src/
    ├── main.jsx                            # React root mount
    ├── App.jsx                             # Router + protected routes
    ├── index.css                           # Tailwind imports + global styles
    ├── api/
    │   └── client.js                       # Axios instance + all API functions
    ├── context/
    │   └── AuthContext.jsx                 # Global auth state (login/logout/register)
    ├── components/
    │   ├── Layout.jsx                      # Sidebar navigation (role-aware)
    │   └── UI.jsx                          # Shared components: StatCard, Badge, EmptyState
    └── pages/
        ├── auth/
        │   └── LoginPage.jsx               # Login + Register with country code picker
        ├── patient/
        │   └── Dashboard.jsx               # Patient home dashboard
        ├── doctor/
        │   └── DoctorDashboard.jsx         # Doctor home dashboard
        ├── caregiver/
        │   ├── CaregiverDashboard.jsx      # Caregiver home dashboard
        │   └── ChangeDoctorPage.jsx        # Reassign patient's doctor
        ├── admin/
        │   └── AdminDashboard.jsx          # Admin: approve/reject doctors + user list
        └── shared/
            ├── RecordsPage.jsx             # Medical records (view/create/edit/delete)
            ├── MedicationsPage.jsx         # Medications + prescription + dose logging
            ├── AppointmentsPage.jsx        # Schedule + manage appointments
            ├── LocationPage.jsx            # GPS map + safe zones + history
            ├── MessagesPage.jsx            # Chat threads between users
            └── NotificationsPage.jsx       # Notification feed + mark read
```

---

## User Roles & Routes

| Role | Home Route | Available Pages |
|------|-----------|----------------|
| Patient | `/patient` | Dashboard, Records, Medications, Appointments, Location, Messages, Notifications |
| Doctor | `/doctor` | Dashboard, Patients, Records, Medications, Appointments, Messages, Notifications |
| Caregiver | `/caregiver` | Dashboard, Change Doctor, Track Location, Medications, Appointments, Messages, Alerts |
| Admin | `/admin` | Dashboard (approve doctors), Users, Appointments, Notifications |

Unauthenticated users are automatically redirected to `/login`.

---

## Pages Overview

### Login / Register (`/login`)
- Toggle between Sign In and Register
- **Phone number field** includes a country code dropdown (19 countries, default: Jordan +962)
- **Doctor registration** shows a warning that admin approval is required
- After doctor registration, shows pending message and redirects to login
- JWT token stored in `localStorage` after successful login

### Patient Dashboard (`/patient`)
- Stats: active medications, upcoming appointments, unread alerts, total records
- Today's medications list with reminder times
- Upcoming appointments with location and time
- Recent notifications feed

### Doctor Dashboard (`/doctor`)
- Stats: total patients, upcoming appointments, unread alerts
- Upcoming appointments sorted by date
- Patient list with email preview
- Recent alerts feed

### Caregiver Dashboard (`/caregiver`)
- Patient location status (safe / outside safe zone)
- Active medications list
- Upcoming appointments grid
- Active alerts count

### Admin Dashboard (`/admin`)
- Stats: total users, patients, approved doctors, pending approvals
- **Pending doctor approvals panel** — Approve or Reject with one click
- Full user list with role and status badges

### Change Doctor Page (`/caregiver/change-doctor`)
- Search and select a patient from the list
- Search and select an approved doctor from the list
- Summary card showing the change before confirming
- Sends notification to patient on success

### Medical Records (`*/records`)
- Expand/collapse each record card
- Doctor/Admin: create, edit, delete records
- Patient: view only
- Search by title or diagnosis
- Load records for any patient by ID (doctor/admin)

### Medications (`*/medications`)
- Active prescription cards with dosage, frequency, reminder times
- Patient: log dose as Taken or Missed
- Doctor: prescribe new medication, stop active medication
- Missed dose automatically creates a notification

### Appointments (`*/appointments`)
- Filter tabs: All / Scheduled / Completed / Cancelled
- Stat cards that act as filter buttons
- Overdue badge for past scheduled appointments
- Doctor: mark as Complete or Cancel
- Doctor/Caregiver: schedule new appointment via modal

### Location Tracking (`*/location`)
- Leaflet map with patient marker and safe zone circles
- Status banner: Safe (green) or Outside safe zone (red)
- Doctor/Caregiver: add and delete safe zones
- Location history table (last 10 entries)
- Update location using browser GPS

### Messages (`*/messages`)
- Contact list on the left, chat thread on the right
- Auto-scroll to latest message
- Read receipt (marks messages as read when thread is opened)

### Notifications (`*/notifications`)
- Color-coded by type: medication, appointment, message, location alert
- Mark individual notifications as read
- Mark all as read button
- Unread shown in blue, read in gray

---

## API Connection

All calls go through `src/api/client.js`. The base URL defaults to `http://localhost:8000`.

To change it, create a `.env` file in `mem-frontend/`:
```
VITE_API_URL=http://localhost:8000
```

The Axios interceptor automatically:
- Attaches JWT token from `localStorage` to every request
- Redirects to `/login` on any 401 response

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Blank page / no styles | Ensure `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` exist |
| "Entry point" Vite warning | Add `vite.config.js` with the React plugin |
| API calls failing (CORS error) | Ensure backend is running on port 8000 |
| Map tiles not loading | Requires internet connection (OpenStreetMap) |
| Login redirects to wrong page | Check the `role` returned in the JWT response |
