-- CARMS Database Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BACKOFFICE MODULE
-- ============================================

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    parent_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('system', 'module')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES employees(id),
    system_role VARCHAR(20) DEFAULT 'User',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User Module Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- AUTO MODULE (Vehicle Management)
-- ============================================

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER,
    color VARCHAR(30),
    usage_type VARCHAR(20) CHECK (usage_type IN ('pool', 'executive')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance')),
    assigned_employee_id UUID REFERENCES employees(id),
    current_mileage INTEGER DEFAULT 0,
    fuel_level INTEGER DEFAULT 100,
    insurance_expiry DATE,
    tax_expiry DATE,
    last_oil_change_mileage INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Car Bookings Table
CREATE TABLE IF NOT EXISTS car_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id),
    employee_id UUID REFERENCES employees(id),
    purpose TEXT NOT NULL,
    destination VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-use', 'completed', 'cancelled')),
    approved_by UUID REFERENCES employees(id),
    start_mileage INTEGER,
    end_mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEETING MODULE
-- ============================================

-- Meeting Rooms Table
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    building VARCHAR(50),
    floor INTEGER,
    capacity INTEGER DEFAULT 10,
    facilities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Room Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES meeting_rooms(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    booked_by UUID REFERENCES employees(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendees_count INTEGER,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LEAVE MODULE
-- ============================================

-- Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    max_days_per_year INTEGER NOT NULL,
    requires_document BOOLEAN DEFAULT false,
    min_days_notice INTEGER DEFAULT 0,
    allow_backdate_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave Quotas Table
CREATE TABLE IF NOT EXISTS leave_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    leave_type_id UUID REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    total_days NUMERIC(5,2) NOT NULL,
    used_days NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    leave_type_id UUID REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days NUMERIC(5,2) NOT NULL,
    reason TEXT NOT NULL,
    attachment_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_car_bookings_car ON car_bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_car_bookings_dates ON car_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default company
INSERT INTO companies (code, name, name_en) 
VALUES ('CARMS', 'บริษัท คาร์มส จำกัด', 'CARMS Co., Ltd.')
ON CONFLICT (code) DO NOTHING;

-- Insert default roles
INSERT INTO roles (code, name, type, description) VALUES
('ADMIN', 'Admin', 'system', 'System Administrator'),
('USER', 'User', 'system', 'Regular User'),
('HR_ADMIN', 'HR Admin', 'module', 'HR Module Administrator'),
('CAR_ADMIN', 'Car Admin', 'module', 'Auto Module Administrator'),
('MEETING_ADMIN', 'Meeting Admin', 'module', 'Meeting Room Administrator'),
('LEAVE_APPROVER', 'Leave Approver', 'module', 'Leave Request Approver')
ON CONFLICT (code) DO NOTHING;

-- Insert leave types
INSERT INTO leave_types (code, name, name_en, max_days_per_year, requires_document, allow_backdate_days) VALUES
('SICK', 'ลาป่วย', 'Sick Leave', 30, false, 30),
('ANNUAL', 'ลาพักร้อน', 'Annual Leave', 10, false, 0),
('PERSONAL', 'ลากิจ', 'Personal Leave', 5, false, 0),
('MATERNITY', 'ลาคลอด', 'Maternity Leave', 90, true, 0)
ON CONFLICT (code) DO NOTHING;

-- Insert default departments
INSERT INTO departments (code, name, name_en) VALUES
('IT', 'แผนกเทคโนโลยีสารสนเทศ', 'Information Technology'),
('HR', 'แผนกทรัพยากรบุคคล', 'Human Resources'),
('FIN', 'แผนกการเงิน', 'Finance'),
('MKT', 'แผนกการตลาด', 'Marketing')
ON CONFLICT (code) DO NOTHING;

-- Insert default positions
INSERT INTO positions (code, name, name_en, level) VALUES
('MGR', 'ผู้จัดการ', 'Manager', 3),
('SR', 'พนักงานอาวุโส', 'Senior Staff', 2),
('JR', 'พนักงาน', 'Staff', 1)
ON CONFLICT (code) DO NOTHING;

-- Insert sample meeting rooms
INSERT INTO meeting_rooms (name, name_en, building, floor, capacity, facilities) VALUES
('ห้องประชุม A', 'Meeting Room A', 'อาคาร 1', 5, 20, ARRAY['projector', 'whiteboard', 'video_conference']),
('ห้องประชุม B1', 'Meeting Room B1', 'อาคาร 1', 3, 10, ARRAY['projector', 'whiteboard']),
('ห้องประชุม C', 'Meeting Room C', 'อาคาร 2', 2, 8, ARRAY['whiteboard', 'tv_screen'])
ON CONFLICT DO NOTHING;

-- Insert sample employees (users will be created by backend seed.js with proper password hash)
INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
SELECT 'EMP001', 'สมชาย', 'ใจดี', 'Somchai', 'Jaidee', 'admin@carms.co.th', '081-111-1111', d.id, p.id
FROM departments d, positions p WHERE d.code = 'IT' AND p.code = 'MGR'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
SELECT 'EMP002', 'สมหญิง', 'รักงาน', 'Somying', 'Rakngarn', 'hr@carms.co.th', '081-222-2222', d.id, p.id
FROM departments d, positions p WHERE d.code = 'HR' AND p.code = 'MGR'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO employees (employee_code, first_name, last_name, first_name_en, last_name_en, email, phone, department_id, position_id)
SELECT 'EMP003', 'วิชัย', 'เก่งมาก', 'Wichai', 'Kengmak', 'user@carms.co.th', '081-333-3333', d.id, p.id
FROM departments d, positions p WHERE d.code = 'IT' AND p.code = 'JR'
ON CONFLICT (employee_code) DO NOTHING;

-- Add sample cars
INSERT INTO cars (license_plate, brand, model, year, color, usage_type, status, current_mileage, fuel_level, insurance_expiry, tax_expiry) VALUES
('กข 1234', 'Toyota', 'Camry', 2024, 'ดำ', 'pool', 'available', 45000, 80, '2026-03-15', '2026-06-30'),
('ขค 5678', 'Honda', 'Accord', 2023, 'ขาว', 'pool', 'available', 62000, 60, '2026-02-20', '2026-05-15'),
('คง 9012', 'Mercedes-Benz', 'E-Class', 2025, 'ดำ', 'executive', 'available', 15000, 90, '2027-01-01', '2027-01-01')
ON CONFLICT (license_plate) DO NOTHING;

-- Note: Users, user_roles, and leave_quotas are created by backend seed.js with proper bcrypt password
-- CARMS Database initialized successfully!
