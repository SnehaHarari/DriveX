-- DriveX Car Rental — PostgreSQL Schema
-- Run: psql -U postgres -f schema.sql

CREATE DATABASE carrental;
\c carrental;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Sedan','SUV','Sports','Electric','Luxury','Hatchback','MUV')),
  fuel VARCHAR(10) NOT NULL CHECK (fuel IN ('Petrol','Diesel','Electric','Hybrid')),
  seats INT NOT NULL DEFAULT 5,
  transmission VARCHAR(10) DEFAULT 'Manual' CHECK (transmission IN ('Manual','Automatic')),
  price_per_day NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(500),
  description TEXT,
  features TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location VARCHAR(200),
  total_days INT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@carrental.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed sample cars
INSERT INTO cars (name, brand, type, fuel, seats, transmission, price_per_day, image_url, description, features) VALUES
('Swift Dzire', 'Maruti', 'Sedan', 'Petrol', 5, 'Manual', 1499.00, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', 'Comfortable and fuel-efficient sedan perfect for city drives.', 'AC,Music System,Power Steering,ABS'),
('Creta', 'Hyundai', 'SUV', 'Petrol', 5, 'Automatic', 2499.00, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800', 'Popular SUV with great road presence and comfort.', 'Sunroof,AC,Touchscreen,Cruise Control'),
('Nexon EV', 'Tata', 'Electric', 'Electric', 5, 'Automatic', 2999.00, 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'India''s best-selling electric SUV with 400km range.', 'Fast Charging,Connected Car,AC,ADAS'),
('Fortuner', 'Toyota', 'SUV', 'Diesel', 7, 'Automatic', 4999.00, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'Premium 7-seater SUV built for all terrains.', '4x4,Sunroof,Leather Seats,360 Camera'),
('City', 'Honda', 'Sedan', 'Petrol', 5, 'Automatic', 2199.00, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Premium sedan with excellent cabin space and features.', 'Honda Sensing,AC,Wireless Charging,Sunroof'),
('Baleno', 'Maruti', 'Hatchback', 'Petrol', 5, 'Manual', 1299.00, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800', 'Smart hatchback with bold design and great mileage.', 'HUD,AC,360 Camera,Wireless Charging'),
('XUV700', 'Mahindra', 'SUV', 'Diesel', 7, 'Automatic', 3999.00, 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'Feature-packed SUV with ADAS and premium interiors.', 'ADAS,Panoramic Sunroof,Harman Audio,12.3 inch Screen'),
('BMW 3 Series', 'BMW', 'Luxury', 'Petrol', 5, 'Automatic', 8999.00, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'The ultimate driving machine for luxury experience.', 'M Sport,Harman Kardon,HUD,Leather Seats');