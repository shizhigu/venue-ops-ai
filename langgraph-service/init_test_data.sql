-- Initialize test data for development

-- Create a test venue
INSERT INTO venues (
    id,
    name,
    code,
    plan,
    created_at,
    config
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Venue',
    'TEST001',
    'professional',
    NOW(),
    '{
        "address": "123 Test Street, Test City",
        "contact": {"phone": "555-0100", "email": "test@venue.com"},
        "areas": ["Main Entrance", "Conference Room A", "B区", "C区"],
        "capacity": 5000,
        "features": ["会议", "展览"],
        "business_hours": {"open": "08:00", "close": "22:00"},
        "ai_settings": {
            "auto_assign": true,
            "priority_rules": {},
            "response_time_target": 10
        }
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create test users (manager and workers)
INSERT INTO users (
    id,
    venue_id,
    email,
    phone,
    name,
    role,
    is_active,
    created_at,
    metadata
) VALUES 
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'manager@test.com',
    '555-0101',
    'Test Manager',
    'manager',
    true,
    NOW(),
    '{
        "department": "管理部",
        "skills": ["管理", "调度"],
        "preferences": {
            "notification": "push",
            "language": "zh-CN"
        }
    }'::jsonb
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'worker1@test.com',
    '555-0102',
    'Worker One',
    'worker',
    true,
    NOW(),
    '{
        "department": "维修部",
        "skills": ["电工", "水工"],
        "certifications": ["电工证"],
        "work_schedule": {
            "shift": "早班",
            "days": ["周一", "周二", "周三", "周四", "周五"]
        }
    }'::jsonb
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'worker2@test.com',
    '555-0103',
    'Worker Two',
    'worker',
    true,
    NOW(),
    '{
        "department": "清洁部",
        "skills": ["清洁", "消毒"],
        "work_schedule": {
            "shift": "晚班",
            "days": ["周一", "周二", "周三", "周四", "周五"]
        }
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

SELECT 'Test data initialized successfully' as status;