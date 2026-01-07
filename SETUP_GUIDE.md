# 📘 CARMS - คู่มือการติดตั้งและเริ่มต้นใช้งาน

## 📋 สารบัญ
1. [ความต้องการของระบบ](#1-ความต้องการของระบบ)
2. [การติดตั้ง Node.js](#2-การติดตั้ง-nodejs)
3. [การติดตั้งโปรเจ็ค](#3-การติดตั้งโปรเจ็ค)
4. [การรันโปรเจ็ค](#4-การรันโปรเจ็ค)
5. [การเข้าใช้งาน](#5-การเข้าใช้งาน)
6. [โครงสร้างโปรเจ็ค](#6-โครงสร้างโปรเจ็ค)
7. [การแก้ไขปัญหา](#7-การแก้ไขปัญหา)

---

## 1. ความต้องการของระบบ

### ซอฟต์แวร์ที่จำเป็น

| ซอฟต์แวร์ | เวอร์ชันขั้นต่ำ | หมายเหตุ |
|-----------|----------------|----------|
| **Node.js** | 24.0.0 LTS | ใช้เวอร์ชัน LTS ล่าสุด |
| **npm** | 10.0.0 | มาพร้อมกับ Node.js |
| **Git** | 2.40+ | สำหรับ clone โปรเจ็ค |

### ตรวจสอบเวอร์ชัน

เปิด PowerShell หรือ Command Prompt แล้วรันคำสั่ง:

```powershell
# ตรวจสอบ Node.js
node --version
# ควรแสดง: v24.x.x

# ตรวจสอบ npm
npm --version
# ควรแสดง: 10.x.x

# ตรวจสอบ Git
git --version
```

---

## 2. การติดตั้ง Node.js

### วิธีที่ 1: ดาวน์โหลดจากเว็บไซต์ (แนะนำ)

1. ไปที่ https://nodejs.org/
2. ดาวน์โหลด **Node.js 24 LTS** (Windows Installer)
3. รันไฟล์ติดตั้ง (.msi)
4. ทำตามขั้นตอนการติดตั้ง (Next → Next → Install)
5. รีสตาร์ท PowerShell/CMD

### วิธีที่ 2: ใช้ winget (Windows 11)

```powershell
winget install OpenJS.NodeJS.LTS
```

### วิธีที่ 3: ใช้ nvm-windows (สำหรับจัดการหลายเวอร์ชัน)

```powershell
# ติดตั้ง nvm-windows จาก https://github.com/coreybutler/nvm-windows/releases

# จากนั้นรัน:
nvm install 24
nvm use 24
```

---

## 3. การติดตั้งโปรเจ็ค

### ขั้นตอนที่ 1: เปิด Terminal

เปิด PowerShell หรือ Command Prompt แล้ว navigate ไปยังโฟลเดอร์โปรเจ็ค:

```powershell
cd D:\Workspace\crams_copy
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```powershell
# ติดตั้ง dependencies ทั้งหมด (Root + Frontend + Backend)
npm install
```

⏳ รอประมาณ 2-5 นาที (ขึ้นอยู่กับความเร็วอินเทอร์เน็ต)

### ขั้นตอนที่ 3: ตรวจสอบการติดตั้ง

```powershell
# ดูโครงสร้างโปรเจ็ค
dir
```

ควรเห็นโฟลเดอร์:
- `apps/` - มี frontend และ backend
- `node_modules/` - dependencies ที่ติดตั้งแล้ว
- `package.json` - ไฟล์กำหนดค่าโปรเจ็ค

---

## 4. การรันโปรเจ็ค

### วิธีที่ 1: รันทั้ง Frontend และ Backend พร้อมกัน

```powershell
npm run dev
```

### วิธีที่ 2: รันแยกกัน (แนะนำสำหรับ Development)

**Terminal 1 - Backend:**
```powershell
cd D:\Workspace\crams_copy
npm run dev:backend
```
🟢 Backend จะรันที่: http://localhost:3001

**Terminal 2 - Frontend:**
```powershell
cd D:\Workspace\crams_copy
npm run dev:frontend
```
🟢 Frontend จะรันที่: http://localhost:3000

### ตรวจสอบว่ารันสำเร็จ

**Backend สำเร็จ:**
```
╔════════════════════════════════════════════════════════════╗
║                    CARMS API Server                        ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:3001               ║
║  📦 Environment: development                               ║
╚════════════════════════════════════════════════════════════╝
```

**Frontend สำเร็จ:**
```
Nuxt 4.x.x with Nitro 2.x.x

  ➜ Local:    http://localhost:3000/
  ➜ Network:  use --host to expose
```

---

## 5. การเข้าใช้งาน

### เปิดเว็บเบราว์เซอร์

1. เปิด Chrome, Edge หรือ Firefox
2. ไปที่ URL: **http://localhost:3000**
3. จะเห็นหน้า Login

### ข้อมูลสำหรับเข้าสู่ระบบ (Demo)

| บทบาท | อีเมล | รหัสผ่าน |
|-------|-------|----------|
| **Admin** | admin@carms.co.th | admin123 |
| **HR** | hr@carms.co.th | admin123 |
| **User** | user@carms.co.th | admin123 |

### ทดสอบ API โดยตรง

เปิดเบราว์เซอร์ไปที่:
- http://localhost:3001/api/health - ตรวจสอบสถานะ API

---

## 6. โครงสร้างโปรเจ็ค

```
D:\Workspace\crams_copy\
│
├── 📁 apps/
│   ├── 📁 frontend/           # Nuxt 4 Frontend
│   │   ├── pages/            # หน้าเว็บทั้งหมด
│   │   ├── layouts/          # Layout หลัก
│   │   ├── components/       # Vue Components
│   │   ├── stores/           # Pinia State Management
│   │   ├── assets/css/       # CSS Stylesheets
│   │   └── nuxt.config.ts    # Nuxt Configuration
│   │
│   └── 📁 backend/            # Express.js Backend
│       └── src/
│           ├── index.js      # Server Entry Point
│           ├── routes/       # API Routes
│           ├── data/         # Mock Data
│           └── middlewares/  # Auth Middleware
│
├── 📄 package.json            # Root Configuration
└── 📄 README.md              # Documentation
```

---

## 7. การแก้ไขปัญหา

### ❌ Error: "npm" is not recognized

**สาเหตุ:** Node.js ไม่ได้ติดตั้ง หรือไม่ได้อยู่ใน PATH

**วิธีแก้:**
1. ติดตั้ง Node.js ใหม่
2. รีสตาร์ท PowerShell/CMD
3. ตรวจสอบ: `node --version`

---

### ❌ Error: ENOENT - package.json not found

**สาเหตุ:** อยู่ผิดโฟลเดอร์

**วิธีแก้:**
```powershell
cd D:\Workspace\crams_copy
npm install
```

---

### ❌ Error: Port 3000/3001 already in use

**สาเหตุ:** มีโปรแกรมอื่นใช้ Port นี้อยู่

**วิธีแก้:**
```powershell
# หา Process ที่ใช้ Port 3000
netstat -ano | findstr :3000

# Kill Process (แทน PID ด้วยตัวเลขที่พบ)
taskkill /PID <PID> /F
```

---

### ❌ Error: Cannot find module 'xxx'

**สาเหตุ:** Dependencies ไม่ครบ

**วิธีแก้:**
```powershell
# ลบ node_modules แล้วติดตั้งใหม่
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/frontend/node_modules
Remove-Item -Recurse -Force apps/backend/node_modules
npm install
```

---

### ❌ Frontend ไม่เชื่อมต่อ Backend

**สาเหตุ:** Backend ไม่ได้รันอยู่

**วิธีแก้:**
1. ตรวจสอบว่า Backend รันอยู่ที่ port 3001
2. ทดสอบ: http://localhost:3001/api/health
3. ถ้าไม่ได้ ให้รัน `npm run dev:backend` ก่อน

---

## 📞 คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm install` | ติดตั้ง dependencies |
| `npm run dev` | รันทั้ง frontend และ backend |
| `npm run dev:frontend` | รันเฉพาะ frontend |
| `npm run dev:backend` | รันเฉพาะ backend |
| `npm run build` | Build สำหรับ production |

---

## ✅ Checklist ก่อนเริ่มงาน

- [ ] ติดตั้ง Node.js 24 LTS แล้ว
- [ ] รัน `npm install` สำเร็จ
- [ ] Backend รันที่ http://localhost:3001 ✓
- [ ] Frontend รันที่ http://localhost:3000 ✓
- [ ] Login เข้าระบบได้ ✓

---

*สร้างโดย CARMS Development Team • January 2026*
