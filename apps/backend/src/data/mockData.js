// Mock Data Store - In-memory database simulation
// This data will reset when server restarts

import { v4 as uuidv4 } from 'uuid';

// ==================== COMPANIES ====================
export const companies = [
    {
        id: uuidv4(),
        name: 'CARMS Corporation',
        code: 'CARMS',
        address: '123 Business District, Bangkok 10110',
        phone: '02-123-4567',
        email: 'contact@carms.co.th',
        isActive: true,
        createdDate: new Date().toISOString()
    }
];

// ==================== DEPARTMENTS ====================
export const departments = [
    { id: uuidv4(), name: 'Executive', code: 'EXEC', companyId: companies[0].id, isActive: true },
    { id: uuidv4(), name: 'Human Resources', code: 'HR', companyId: companies[0].id, isActive: true },
    { id: uuidv4(), name: 'Information Technology', code: 'IT', companyId: companies[0].id, isActive: true },
    { id: uuidv4(), name: 'Finance', code: 'FIN', companyId: companies[0].id, isActive: true },
    { id: uuidv4(), name: 'Marketing', code: 'MKT', companyId: companies[0].id, isActive: true },
    { id: uuidv4(), name: 'Operations', code: 'OPS', companyId: companies[0].id, isActive: true }
];

// ==================== POSITIONS ====================
export const positions = [
    { id: uuidv4(), name: 'CEO', level: 1, departmentId: departments[0].id },
    { id: uuidv4(), name: 'HR Manager', level: 2, departmentId: departments[1].id },
    { id: uuidv4(), name: 'HR Officer', level: 3, departmentId: departments[1].id },
    { id: uuidv4(), name: 'IT Manager', level: 2, departmentId: departments[2].id },
    { id: uuidv4(), name: 'Software Developer', level: 3, departmentId: departments[2].id },
    { id: uuidv4(), name: 'Finance Manager', level: 2, departmentId: departments[3].id },
    { id: uuidv4(), name: 'Accountant', level: 3, departmentId: departments[3].id }
];

// ==================== EMPLOYEES ====================
export const employees = [
    {
        id: uuidv4(),
        employeeCode: 'EMP001',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        firstNameEn: 'Somchai',
        lastNameEn: 'Jaidee',
        email: 'somchai@carms.co.th',
        phone: '081-234-5678',
        departmentId: departments[2].id,
        positionId: positions[3].id,
        hireDate: '2020-01-15',
        isActive: true,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        employeeCode: 'EMP002',
        firstName: 'สมหญิง',
        lastName: 'รักงาน',
        firstNameEn: 'Somying',
        lastNameEn: 'Rakngarn',
        email: 'somying@carms.co.th',
        phone: '081-345-6789',
        departmentId: departments[1].id,
        positionId: positions[1].id,
        hireDate: '2019-06-01',
        isActive: true,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        employeeCode: 'EMP003',
        firstName: 'วิชัย',
        lastName: 'เก่งมาก',
        firstNameEn: 'Wichai',
        lastNameEn: 'Kengmak',
        email: 'wichai@carms.co.th',
        phone: '081-456-7890',
        departmentId: departments[2].id,
        positionId: positions[4].id,
        hireDate: '2021-03-15',
        isActive: true,
        createdDate: new Date().toISOString()
    }
];

// ==================== ROLES ====================
export const roles = [
    { id: uuidv4(), name: 'Admin', code: 'ADMIN', type: 'system', description: 'System Administrator' },
    { id: uuidv4(), name: 'User', code: 'USER', type: 'system', description: 'Regular User' },
    { id: uuidv4(), name: 'Auto Admin', code: 'AUTO_ADMIN', type: 'module', description: 'Vehicle Management Admin' },
    { id: uuidv4(), name: 'Leave Approver', code: 'LEAVE_APPROVER', type: 'module', description: 'Leave Request Approver' },
    { id: uuidv4(), name: 'Meeting Admin', code: 'MEETING_ADMIN', type: 'module', description: 'Meeting Room Admin' }
];

// ==================== USERS ====================
export const users = [
    {
        id: uuidv4(),
        email: 'admin@carms.co.th',
        // Password: admin123 (bcrypt hashed)
        password: '$2a$10$rQnM1Ey1YRXN1VvHQKQXxOzT8Wd.HJQfQF5Z5KqYgUqLf1oQF0XKq',
        employeeId: employees[0].id,
        systemRole: 'Admin',
        moduleRoles: ['AUTO_ADMIN', 'LEAVE_APPROVER', 'MEETING_ADMIN'],
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: null,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        email: 'hr@carms.co.th',
        password: '$2a$10$rQnM1Ey1YRXN1VvHQKQXxOzT8Wd.HJQfQF5Z5KqYgUqLf1oQF0XKq',
        employeeId: employees[1].id,
        systemRole: 'Admin',
        moduleRoles: ['LEAVE_APPROVER'],
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: null,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        email: 'user@carms.co.th',
        password: '$2a$10$rQnM1Ey1YRXN1VvHQKQXxOzT8Wd.HJQfQF5Z5KqYgUqLf1oQF0XKq',
        employeeId: employees[2].id,
        systemRole: 'User',
        moduleRoles: [],
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: null,
        createdDate: new Date().toISOString()
    }
];

// ==================== CARS ====================
export const cars = [
    {
        id: uuidv4(),
        licensePlate: 'กข 1234',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        color: 'White',
        vin: 'JTDKN3DU5A0123456',
        engineNumber: '2AR-FE1234567',
        usageType: 'pool', // pool = รถส่วนกลาง, executive = รถผู้บริหาร
        status: 'available', // available, in-use, maintenance
        currentMileage: 25000,
        fuelLevel: 80,
        assignedTo: null,
        insuranceExpiry: '2026-06-30',
        taxExpiry: '2026-03-31',
        nextOilChange: 30000,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        licensePlate: 'ขค 5678',
        brand: 'Honda',
        model: 'Accord',
        year: 2024,
        color: 'Black',
        vin: 'JHMCR2F30LC123456',
        engineNumber: 'K24W51234567',
        usageType: 'pool',
        status: 'available',
        currentMileage: 12000,
        fuelLevel: 100,
        assignedTo: null,
        insuranceExpiry: '2026-08-15',
        taxExpiry: '2026-05-20',
        nextOilChange: 20000,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        licensePlate: 'CEO 999',
        brand: 'Mercedes-Benz',
        model: 'S-Class',
        year: 2024,
        color: 'Silver',
        vin: 'WDDUG8CB1LA123456',
        engineNumber: 'M2561234567',
        usageType: 'executive',
        status: 'in-use',
        currentMileage: 8000,
        fuelLevel: 60,
        assignedTo: employees[0].id,
        insuranceExpiry: '2027-01-01',
        taxExpiry: '2026-12-31',
        nextOilChange: 15000,
        createdDate: new Date().toISOString()
    }
];

// ==================== CAR BOOKINGS ====================
export const carBookings = [
    {
        id: uuidv4(),
        carId: cars[0].id,
        employeeId: employees[2].id,
        purpose: 'พบลูกค้าที่เชียงใหม่',
        destination: 'เชียงใหม่',
        startDate: '2026-01-10',
        endDate: '2026-01-12',
        startMileage: null,
        endMileage: null,
        fuelLevelStart: null,
        fuelLevelEnd: null,
        status: 'pending', // pending, approved, rejected, in-use, completed
        approvedBy: null,
        approvedDate: null,
        createdDate: new Date().toISOString()
    }
];

// ==================== MEETING ROOMS ====================
export const meetingRooms = [
    {
        id: uuidv4(),
        name: 'ห้องประชุมใหญ่ A',
        nameEn: 'Main Conference Room A',
        floor: 10,
        building: 'อาคาร A',
        capacity: 20,
        facilities: ['โปรเจคเตอร์', 'ไวท์บอร์ด', 'ระบบ Video Conference', 'เครื่องเสียง'],
        isActive: true,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: 'ห้องประชุมย่อย B1',
        nameEn: 'Small Meeting Room B1',
        floor: 8,
        building: 'อาคาร B',
        capacity: 8,
        facilities: ['โปรเจคเตอร์', 'ไวท์บอร์ด', 'TV'],
        isActive: true,
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        name: 'ห้องประชุมย่อย B2',
        nameEn: 'Small Meeting Room B2',
        floor: 8,
        building: 'อาคาร B',
        capacity: 6,
        facilities: ['ไวท์บอร์ด', 'TV'],
        isActive: true,
        createdDate: new Date().toISOString()
    }
];

// ==================== RESERVATIONS ====================
export const reservations = [
    {
        id: uuidv4(),
        roomId: meetingRooms[0].id,
        employeeId: employees[1].id,
        title: 'ประชุมทีม HR ประจำเดือน',
        description: 'ประชุมสรุปผลงานและวางแผนเดือนหน้า',
        date: '2026-01-08',
        startTime: '10:00',
        endTime: '12:00',
        attendees: 10,
        status: 'confirmed', // confirmed, cancelled
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        roomId: meetingRooms[1].id,
        employeeId: employees[0].id,
        title: 'ประชุม Sprint Planning',
        description: 'วางแผน Sprint ถัดไป',
        date: '2026-01-08',
        startTime: '14:00',
        endTime: '16:00',
        attendees: 6,
        status: 'confirmed',
        createdDate: new Date().toISOString()
    }
];

// ==================== LEAVE TYPES ====================
export const leaveTypes = [
    { id: uuidv4(), name: 'ลาป่วย', code: 'SICK', maxDays: 30, requiresApproval: true, requiresDocument: false, documentRequiredAfterDays: 3 },
    { id: uuidv4(), name: 'ลาพักร้อน', code: 'ANNUAL', maxDays: 10, requiresApproval: true, requiresDocument: false, documentRequiredAfterDays: null },
    { id: uuidv4(), name: 'ลากิจ', code: 'PERSONAL', maxDays: 5, requiresApproval: true, requiresDocument: false, documentRequiredAfterDays: null },
    { id: uuidv4(), name: 'ลาคลอด', code: 'MATERNITY', maxDays: 90, requiresApproval: true, requiresDocument: true, documentRequiredAfterDays: null },
    { id: uuidv4(), name: 'ลาบวช', code: 'ORDINATION', maxDays: 15, requiresApproval: true, requiresDocument: true, documentRequiredAfterDays: null }
];

// ==================== LEAVE QUOTAS ====================
export const leaveQuotas = employees.map(emp => ({
    id: uuidv4(),
    employeeId: emp.id,
    year: 2026,
    quotas: [
        { leaveTypeId: leaveTypes[0].id, total: 30, used: 2, remaining: 28 },
        { leaveTypeId: leaveTypes[1].id, total: 10, used: 3, remaining: 7 },
        { leaveTypeId: leaveTypes[2].id, total: 5, used: 1, remaining: 4 }
    ]
}));

// ==================== LEAVE REQUESTS ====================
export const leaveRequests = [
    {
        id: uuidv4(),
        employeeId: employees[2].id,
        leaveTypeId: leaveTypes[0].id,
        startDate: '2026-01-06',
        endDate: '2026-01-06',
        days: 1,
        reason: 'ไม่สบาย มีไข้',
        documentUrl: null,
        status: 'approved', // pending, approved, rejected, cancelled
        approvedBy: employees[1].id,
        approvedDate: '2026-01-06',
        createdDate: new Date().toISOString()
    },
    {
        id: uuidv4(),
        employeeId: employees[0].id,
        leaveTypeId: leaveTypes[1].id,
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        days: 3,
        reason: 'พักผ่อนกับครอบครัว',
        documentUrl: null,
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        createdDate: new Date().toISOString()
    }
];

export default {
    companies,
    departments,
    positions,
    employees,
    roles,
    users,
    cars,
    carBookings,
    meetingRooms,
    reservations,
    leaveTypes,
    leaveQuotas,
    leaveRequests
};
