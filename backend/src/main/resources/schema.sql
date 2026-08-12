DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS auction_categories;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- 1. Roles Table
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Users Table (Removed role_id column)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

-- 3. Categories
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(1000)
);

-- 4. Auctions (Changed DOUBLE to DECIMAL)
CREATE TABLE auctions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    image VARCHAR(500),
    current_bid DECIMAL(19, 2), -- 19 digits total, 2 after decimal
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

-- 5. Auction-Categories Join Table (Added CASCADE)
CREATE TABLE auction_categories (
    auction_id BIGINT,
    category_id BIGINT,
    PRIMARY KEY (auction_id, category_id),
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 6. User-Roles Join Table (Added CASCADE)
CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 7. Bids (Changed DOUBLE to DECIMAL)
CREATE TABLE bids (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    auction_id BIGINT,
    amount DECIMAL(19, 2), -- Consistency with auctions table
    bid_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);