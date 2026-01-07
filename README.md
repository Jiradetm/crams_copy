# CARMS - Corporate Asset & Resource Management System

CARMS คือแพลตฟอร์มบนเว็บที่ครบวงจรสำหรับการบริหารจัดการทรัพยากรภายในองค์กร ครอบคลุมทั้งการจัดการพนักงาน, จองยานพาหนะ, จองห้องประชุม และระบบลางาน

---

## 🐳 เริ่มต้นใช้งานด้วย Docker (แนะนำ)

### สิ่งที่ต้องมีเบื้องต้น

- **Docker Desktop** สำหรับ Windows/Mac/Linux
  - [ดาวน์โหลด Docker Desktop](https://www.docker.com/products/docker-desktop/)

### การติดตั้งและรันโปรเจ็ค

1. เปิด Terminal หรือ PowerShell ที่โฟลเดอร์โปรเจ็ค:

   ```powershell
   cd D:\Workspace\crams_copy
   ```

2. Build และเริ่มระบบ:

   ```powershell
   docker compose up --build
   ```

   _รอสักครู่ในครั้งแรกเพื่อให้ระบบดาวน์โหลดและติดตั้ง image_

3. เข้าใช้งานระบบ:
   - **หน้าเว็บไซต์ (Frontend):** http://localhost:3000
   - **ระบบหลังบ้าน (Backend API):** http://localhost:3001
   - **ตรวจสอบสถานะ (Health Check):** http://localhost:3001/api/health

### ข้อมูลสำหรับเข้าสู่ระบบ (Demo)

| บทบาท     | อีเมล             | รหัสผ่าน |
| --------- | ----------------- | -------- |
| **Admin** | admin@carms.co.th | admin123 |
| **HR**    | hr@carms.co.th    | admin123 |
| **User**  | user@carms.co.th  | admin123 |

---

## 📦 วิธีการส่งงานให้คนอื่น (Handover Guide)

หากต้องการส่งโปรเจ็คนี้ให้ทีมงานหรือลูกค้า ให้ทำตามขั้นตอนนี้:

### 1. การเตรียมไฟล์ (สำหรับผู้ส่ง)

เพื่อให้ไฟล์มีขนาดเล็กและส่งง่าย:

1. **ลบ** โฟลเดอร์ `node_modules` (ทั้งในโฟลเดอร์หลัก, `apps/backend`, และ `apps/frontend`)
2. **ลบ** โฟลเดอร์ `.nuxt` และ `.output` (ใน `apps/frontend`)
3. **เก็บ** ไฟล์ `.env` ไว้ (ถ้ามีค่า configuration ที่จำเป็น)
4. **ZIP** โฟลเดอร์โปรเจ็คทั้งหมด
5. **ข้อมูลในฐานข้อมูล:** เนื่องจากข้อมูลถูกเก็บใน Docker Volume จะไม่ติดไปกับไฟล์ ZIP หากต้องการส่งข้อมูลด้วย ต้องใช้การ Export SQL script แยกต่างหาก

### 2. การติดตั้ง (สำหรับผู้รับ)

1. ติดตั้ง **Docker Desktop** ให้เรียบร้อย
2. แตกไฟล์ ZIP
3. รันคำสั่ง `docker compose up --build`

---

## 🏗️ System Structure (โครงสร้างระบบ)

ระบบ CARMS ถูกออกแบบด้วยสถาปัตยกรรมแบบ **Monorepo** โดยแบ่งเป็นส่วนประกอบหลักดังนี้:

### 1. Frontend (`apps/frontend`)

- **Technology:** Nuxt 4 (Vue 3 + TypeScript)
- **Styling:** CSS Variables + Glassmorphism Design
- **State Management:** Pinia (Manage Auth, UI State)
- **Features:**
  - ระบบตรวจสอบสิทธิ์ (Middleware Authentication)
  - Responsive Design (รองรับทั้งมือถือและ Desktop)
  - Dark/Light Mode Theme

### 2. Backend (`apps/backend`)

- **Technology:** Node.js + Express.js
- **Database:** PostgreSQL (ผ่าน `pg` driver)
- **Security:**
  - JWT Authentication
  - Bcrypt Password Hashing
  - Role-Based Access Control (RBAC) middleware

### 3. Database

- **PostgreSQL 16:** ใช้เก็บข้อมูลสัมพัทธ์ (Relational Data)
- **Seed Data:** ระบบจะสร้างข้อมูลตั้งต้น (Admin, Mock Data) ให้โดยอัตโนมัติเมื่อเริ่มรันครั้งแรก

---

## 💡 Key Functionality (ฟังก์ชันการทำงานหลัก)

### 1. 📊 Dashboard (แดชบอร์ด)

- แสดงภาพรวมของระบบ: จำนวนพนักงาน, รถที่ถูกจอง, การประชุมวันนี้, คำขอลาที่รออนุมัติ
- **Activity Feed:** แสดงรายการความเคลื่อนไหวล่าสุด (เช่น ใครจองรถ, ใครลางาน)
- **Alerts:** แจ้งเตือนรถที่ใกล้ทะเบียนขาด หรือ ประกันหมดอายุล่วงหน้า 30 วัน

### 2. 🔐 Backoffice (จัดการข้อมูลหลังบ้าน)

- **User Management:** เพิ่ม/ลบ/แก้ไข ผู้ใช้งานระบบ
- **Employee Info:** จัดการข้อมูลพนักงาน รหัสพนักงาน แผนก และตำแหน่ง
- **Roles & Permissions:** กำหนดสิทธิ์การเข้าถึง (Admin, HR, User)

### 3. 🚗 Auto (ระบบยานพาหนะ)

- **Car Booking:** จองรถบริษัท ระบุวัตถุประสงค์และสถานที่
- **Status Tracking:** ติดตามสถานะ (รออนุมัติ, อนุมัติแล้ว, กำลังใช้งาน, คืนรถแล้ว)
- **Maintenance:** แจ้งเตือนเมื่อถึงกำหนดต่อภาษี/พรบ. หรือถ่ายน้ำมันเครื่อง

### 4. 🏟️ Meeting (ระบบห้องประชุม)

- **Calendar View:** ดูปฏิทินการจองห้องประชุมแบบรายเดือน/สัปดาห์
- **Booking Flow:** เลือกห้องประชุม ระบุเวลา (ระบบป้องกันการจองซ้อนทับ)
- **Room Management:** (Admin) จัดการรายชื่อห้องประชุมและความจุ

### 5. 🏖️ Leave (ระบบลางาน)

- **Request Flow:** ยื่นใบลา (ป่วย, กิจ, พักร้อน) พร้อมระบุเหตุผล
- **Quota Check:** ตรวจสอบวันลาคงเหลือแบบ Real-time ก่อนบันทึก
- **Approval:** หัวหน้างาน/HR สามารถกดอนุมัติหรือไม่อนุมัติได้
- **Admin View:** ผู้ดูแลระบบสามารถดูโควต้าวันลาของพนักงานทุกคนได้ในหน้าเดียว

---

## 🔧 การแก้ไขปัญหาเบื้องต้น (Troubleshooting)

### Docker Desktop ไม่ทำงาน

ตรวจสอบให้แน่ใจว่าเปิดโปรแกรม Docker Desktop แล้ว และไอคอนที่ System Tray เป็นสีเขียว

### Port 3000/3001 ถูกใช้งานอยู่

```powershell
# หยุด containers ที่รันอยู่
docker compose down

# ล้างระบบ (ถ้าจำเป็น)
docker system prune -f
```

### Build ไม่ผ่าน

```powershell
# สร้างใหม่โดยไม่ใช้ cache
docker compose build --no-cache
docker compose up
```

---

_คู่มือการใช้งาน CARMS Docker • มกราคม 2569_
