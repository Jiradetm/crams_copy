# 🐳 คู่มือการรันด้วย Docker

## ความต้องการ

- **Docker Desktop** สำหรับ Windows
  - ดาวน์โหลด: https://www.docker.com/products/docker-desktop/
  - ติดตั้งและเปิดใช้งาน

## ตรวจสอบการติดตั้ง Docker

```powershell
# ตรวจสอบ Docker version
docker --version
# ควรแสดง: Docker version 24.x.x

# ตรวจสอบ Docker Compose
docker compose version
# ควรแสดง: Docker Compose version v2.x.x
```

---

## 🚀 การรันโปรเจ็ค

### วิธีที่ 1: รันด้วยคำสั่งเดียว (แนะนำ)

```powershell
# ไปที่โฟลเดอร์โปรเจ็ค
cd D:\Workspace\crams_copy

# Build และรัน containers
docker compose up --build
```

รอประมาณ 3-5 นาที (ครั้งแรก)

### วิธีที่ 2: รันแบบ Background

```powershell
# รันในโหมด detached (background)
docker compose up -d --build

# ดู logs
docker compose logs -f
```

---

## 🌐 การเข้าใช้งาน

| Service          | URL                              |
| ---------------- | -------------------------------- |
| **Frontend**     | http://localhost:3000            |
| **Backend API**  | http://localhost:3001            |
| **Health Check** | http://localhost:3001/api/health |

### Demo Login

| Email             | Password |
| ----------------- | -------- |
| admin@carms.co.th | admin123 |
| hr@carms.co.th    | admin123 |
| user@carms.co.th  | admin123 |

---

## 📋 คำสั่งที่ใช้บ่อย

| คำสั่ง                      | คำอธิบาย             |
| --------------------------- | -------------------- |
| `docker compose up --build` | Build และรัน         |
| `docker compose up -d`      | รันแบบ Background    |
| `docker compose down`       | หยุดและลบ containers |
| `docker compose logs -f`    | ดู logs แบบ realtime |
| `docker compose restart`    | รีสตาร์ท services    |
| `docker compose ps`         | ดูสถานะ containers   |

---

## 🔧 การแก้ไขปัญหา

### ❌ Docker Desktop ไม่รัน

**วิธีแก้:** เปิด Docker Desktop แล้วรอให้พร้อมใช้งาน (ไอคอนขวาล่างเป็นสีเขียว)

### ❌ Port 3000/3001 ถูกใช้งานอยู่

```powershell
# หยุด containers เดิม
docker compose down

# ลบ containers ทั้งหมด
docker system prune -f
```

### ❌ Build ไม่สำเร็จ

```powershell
# ลบ cache และ build ใหม่
docker compose build --no-cache
docker compose up
```

---

## 🛑 การหยุดโปรเจ็ค

```powershell
# หยุด containers
docker compose down

# หยุดและลบ volumes ด้วย
docker compose down -v
```

---

_CARMS Docker Guide • January 2026_
