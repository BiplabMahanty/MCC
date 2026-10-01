# Getting Started

## Prerequisites

- Node.js 24 LTS (`^20.19.4 || ^22.13.0 || >=24.3.0`)
- npm
- Docker Desktop
- Android Studio + Android SDK + emulator or USB-debuggable device

---

## 1. Configure environment files

```powershell
Copy-Item .\backend\.env.example .\backend\.env
Copy-Item .\mcc_mobile\.env.example .\mcc_mobile\.env
```

Edit `backend/.env` and set:

```dotenv
JWT_ACCESS_SECRET=<at-least-32-random-chars>
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=<strong-password>
SEED_ADMIN_INSTITUTE_ID=000000000000000000000001
```

Generate a JWT secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

For a physical Android device, replace `10.0.2.2` in `mcc_mobile/.env` with your machine's LAN IP.

---

## 2. Install dependencies

```powershell
Set-Location .\backend;   npm.cmd ci
Set-Location ..\mcc_mobile; npm.cmd ci
Set-Location ..
```

---

## 3. Start MongoDB and Redis

```powershell
docker compose up -d
docker compose ps   # wait until both show "healthy"
```

---

## 4. Seed the admin account

```powershell
Set-Location .\backend
npm.cmd run seed:admin
Set-Location ..
```

---

## 5. Start the backend

```powershell
Set-Location .\backend
npm.cmd run dev
```

Verify: `Invoke-RestMethod http://127.0.0.1:4000/api/health`

---

## 6. Build and run the Android app

> First run — compiles and installs the development client:

```powershell
Set-Location .\mcc_mobile
npm.cmd run android:dev-build
```

> Subsequent JS-only sessions (after the dev client is installed):

```powershell
Set-Location .\mcc_mobile
npm.cmd start
```

Open the **Coaching Management System** dev client on the device/emulator and connect to Metro.

---

## Quality checks

```powershell
# Backend
Set-Location .\backend
npm.cmd run lint
npm.cmd run format:check
npm.cmd test

# Mobile
Set-Location ..\mcc_mobile
npm.cmd run lint
npm.cmd run format:check
npm.cmd run doctor
npx.cmd expo export --platform android
```
