-- RentalCar Comprehensive Demo Data
-- Default password for all accounts: password
-- BCrypt hash for 'password': $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu

-- 1. SEED USERS (1 Admin, 5 Users)
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at) 
VALUES 
('admin@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Admin', 'User', 'ADMIN', true, NOW(), NOW()),
('user@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'John', 'Doe', 'USER', true, NOW(), NOW()),
('user1@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Alice', 'Smith', 'USER', true, NOW(), NOW()),
('user2@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Bob', 'Johnson', 'USER', true, NOW(), NOW()),
('user3@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Charlie', 'Brown', 'USER', true, NOW(), NOW()),
('user4@rentalcar.tn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'Diana', 'Prince', 'USER', true, NOW(), NOW());

-- 2. SEED CARS (12 Diverse Cars)
INSERT INTO cars (brand, model, year, price_per_day, transmission, fuel_type, available, image_url, description, seats, category, created_at)
VALUES
('Mercedes', 'AMG GT', 2023, 450.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000000/rentalcar/cars/mercedes-amg-gt.jpg', 'High-performance luxury sports car with unparalleled speed and style.', 2, 'Luxury', NOW()),
('BMW', 'X7 M50i', 2022, 350.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000001/rentalcar/cars/bmw-x7.jpg', 'The ultimate luxury SUV for family trips and long drives.', 7, 'SUV', NOW()),
('Audi', 'RS7 Sportback', 2023, 400.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000002/rentalcar/cars/audi-rs7.jpg', 'Aggressive styling meets premium comfort in this performance sedan.', 5, 'Luxury', NOW()),
('Tesla', 'Model S Plaid', 2023, 300.0, 'AUTOMATIC', 'ELECTRIC', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000003/rentalcar/cars/tesla-model-s.jpg', 'Lightning fast acceleration and cutting-edge electric technology.', 5, 'Electric', NOW()),
('Porsche', '911 Carrera S', 2022, 500.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000004/rentalcar/cars/porsche-911.jpg', 'The iconic sports car that provides the pure driving experience.', 4, 'Luxury', NOW()),
('Land Rover', 'Defender 110', 2023, 280.0, 'AUTOMATIC', 'DIESEL', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000005/rentalcar/cars/land-rover-defender.jpg', 'Rugged, capable, and luxury-oriented off-road master.', 5, 'SUV', NOW()),
('Volkswagen', 'Golf R', 2022, 120.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000006/rentalcar/cars/vw-golf-r.jpg', 'The perfect hot hatch for daily commutes and spirited driving.', 5, 'Compact', NOW()),
('Toyota', 'RAV4 Hybrid', 2023, 95.0, 'AUTOMATIC', 'HYBRID', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000007/rentalcar/cars/toyota-rav4.jpg', 'Efficient, reliable, and comfortable SUV for all your needs.', 5, 'SUV', NOW()),
('Ford', 'Mustang GT', 2022, 180.0, 'MANUAL', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000008/rentalcar/cars/ford-mustang.jpg', 'Classic American muscle with a powerful V8 engine.', 4, 'Sports', NOW()),
('Jeep', 'Wrangler Rubicon', 2023, 220.0, 'AUTOMATIC', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000009/rentalcar/cars/jeep-wrangler.jpg', 'Unlocked adventure with the most capable Wrangler ever.', 5, 'SUV', NOW()),
('Honda', 'Civic Type R', 2023, 150.0, 'MANUAL', 'GASOLINE', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000010/rentalcar/cars/honda-civic-typer.jpg', 'The ultimate front-wheel drive performance machine.', 5, 'Compact', NOW()),
('Range Rover', 'Vogue', 2022, 420.0, 'AUTOMATIC', 'DIESEL', true, 'https://res.cloudinary.com/dvm3eteit/image/upload/v1706000011/rentalcar/cars/range-rover-vogue.jpg', 'Peerless refinement and luxury for the most discerning travelers.', 5, 'Luxury', NOW());

-- 3. SEED BOOKINGS (Mix of statuses and users)
-- Assuming IDs are sequential starting from 1
INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status, created_at)
VALUES
(2, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 1350.0, 'CONFIRMED', NOW()),
(3, 2, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 700.0, 'PENDING', NOW()),
(4, 3, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 1200.0, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 4, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 300.0, 'PENDING', NOW()),
(6, 5, DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 2500.0, 'CONFIRMED', NOW()),
(2, 6, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), 560.0, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(3, 7, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 120.0, 'REJECTED', NOW()),
(4, 8, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 285.0, 'CANCELLED', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(5, 9, DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 12 DAY), 720.0, 'PENDING', NOW()),
(6, 10, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 880.0, 'CONFIRMED', DATE_SUB(NOW(), INTERVAL 2 DAY));
