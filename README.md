# 🛍️ ShopSphere

### Full-Stack E-Commerce Application

ShopSphere is a full-stack e-commerce web application built with **Spring Boot, React, MySQL, and JWT-based authentication**.

The application provides a simple and modern shopping experience where users can browse products, search and filter products, add products to their cart, and manage their orders.

---

## ✨ Features

### 👤 User Authentication
- User registration and login
- JWT-based authentication
- Secure API access
- Protected user-specific features

### 🛒 Shopping
- Browse available products
- Product images
- Product descriptions and pricing
- Stock availability
- Add products to cart
- View cart items
- Manage shopping orders

### 🔍 Product Search & Filtering
- Search products by name
- Filter products by minimum price
- Filter products by maximum price
- Show only products currently in stock
- Clear filters
- Pagination for product listings

### 📦 Order Management
- Place orders from the shopping cart
- View previous orders
- Track order information

### 🎨 User Interface
- Responsive React-based interface
- Modern dark-themed design
- Product cards
- Search and filter interface
- Shopping cart and order sections

---

## 🛠️ Tech Stack

### Frontend

- React
- JavaScript
- HTML
- CSS
- Vite

### Backend

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT Authentication

### Database

- MySQL

### Development Tools

- Git
- GitHub
- Visual Studio Code
- Maven

---

## 🏗️ Project Architecture

ShopSphere follows a full-stack architecture:

```text
┌───────────────────────────┐
│        React Frontend     │
│                           │
│  Products │ Cart │ Orders │
└─────────────┬─────────────┘
              │
              │ REST API
              ▼
┌───────────────────────────┐
│      Spring Boot API      │
│                           │
│ Controllers               │
│ Services                  │
│ Repositories              │
│ Security / JWT            │
└─────────────┬─────────────┘
              │
              │ JPA / Hibernate
              ▼
┌───────────────────────────┐
│          MySQL            │
│                           │
│ Users │ Products │ Cart   │
│ Orders │ Transactions     │
└───────────────────────────┘

## 📁 Project Structure

```text
ShopSphere/
│
├── frontend/
│   ├── public/
│   │   └── products/
│   │       ├── headphones.jpg
│   │       ├── earbuds.jpg
│   │       ├── keyboard.jpg
│   │       ├── mouse.jpg
│   │       ├── smart-tv.jpg
│   │       ├── power-bank.jpg
│   │       ├── led-lamp.jpg
│   │       ├── bluetooth-speaker.jpg
│   │       └── laptop-stand.jpg
│   │
│   └── src/
│       ├── App.jsx
│       ├── Products.jsx
│       ├── Orders.jsx
│       ├── App.css
│       ├── Products.css
│       ├── Orders.css
│       └── main.jsx
│
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── shibankar/
│                   └── shopsphere/
│                       ├── controller/
│                       ├── entity/
│                       ├── repository/
│                       ├── service/
│                       └── security/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
