-- RentalCar Default Demo Data
-- Password for all: password

-- 1. SEED USERS
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'admin@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Admin', 'User', 'ADMIN', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'admin@rentalcar.tn') LIMIT 1;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'user@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'John', 'Doe', 'USER', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'user@rentalcar.tn') LIMIT 1;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'user1@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Alice', 'Smith', 'USER', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'user1@rentalcar.tn') LIMIT 1;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'user2@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Bob', 'Johnson', 'USER', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'user2@rentalcar.tn') LIMIT 1;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'user3@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Charlie', 'Brown', 'USER', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'user3@rentalcar.tn') LIMIT 1;

INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
SELECT * FROM (SELECT 'user4@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Diana', 'Prince', 'USER', true, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (SELECT email FROM users WHERE email = 'user4@rentalcar.tn') LIMIT 1;

-- 2. SEED CARS (Conditional insert)
INSERT INTO cars (brand, model, year, price_per_day, transmission, fuel_type, available, image_url, description, seats, category, created_at)
SELECT * FROM (
    SELECT 'Mercedes', 'AMG GT', 2023, 450.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000000/rentalcar/cars/mercedes-amg-gt.jpg', 'High-performance luxury sports car.', 2, 'Luxury', NOW() UNION ALL
    SELECT 'BMW', 'X7 M50i', 2022, 350.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000001/rentalcar/cars/bmw-x7.jpg', 'Ultimate luxury SUV.', 7, 'SUV', NOW() UNION ALL
    SELECT 'Audi', 'RS7', 2023, 400.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000002/rentalcar/cars/audi-rs7.jpg', 'Performance sedan.', 5, 'Luxury', NOW() UNION ALL
    SELECT 'Tesla', 'Model S', 2023, 300.0, 'AUTOMATIC', 'ELECTRIC', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000003/rentalcar/cars/tesla-model-s.jpg', 'Electric technology.', 5, 'Electric', NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cars) LIMIT 4;

-- 3. SEED BOOKINGS (Only if tables are empty)
INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status, created_at)
SELECT * FROM (
    SELECT 2, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 1350.0, 'CONFIRMED', NOW() UNION ALL
    SELECT 3, 2, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 700.0, 'PENDING', NOW()
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM bookings) AND (SELECT COUNT(*) FROM users) >= 3 AND (SELECT COUNT(*) FROM cars) >= 2 LIMIT 2;
