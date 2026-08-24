# 🛍️ ShopSphere

A modern **full-stack e-commerce application** built using **Spring Boot**, **React**, **Spring Data JPA**, **Spring Security**, **JWT Authentication**, and **MySQL**.

ShopSphere provides a complete shopping experience with secure authentication, product browsing, search and filtering, shopping cart management, and order tracking through a responsive and user-friendly interface.

---

## ✨ Features

### 🔐 Authentication & Security

- 🔑 User Registration and Login
- 🛡️ JWT-based Authentication
- 🔒 Spring Security integration
- 🚪 Secure Logout
- 🔐 Protected API endpoints
- 🔑 Password encryption using BCrypt

### 🛍️ Product Management

- 📦 Display products dynamically from the backend
- 🖼️ Product images
- 🔍 Search products by name
- 💰 Filter products by minimum and maximum price
- 📊 Filter products by stock availability
- ↕️ Product pagination
- 📋 Product descriptions and pricing
- 📦 Real-time stock information

### 🛒 Shopping Cart

- ➕ Add products to cart
- 🔢 Add product quantity
- 🛍️ View cart items
- 💰 Calculate cart totals
- 🔄 Update cart contents
- 🗑️ Remove products from cart

### 📦 Orders

- 🧾 Place orders
- 📋 View order history
- 💰 View order totals
- 📦 Track purchased products
- 🔐 User-specific order management

### 🎨 User Interface

- ⚛️ React-based frontend
- 📱 Responsive design
- 🎯 Clean product cards
- 🔎 Search and filter interface
- 📄 Pagination controls
- 🔔 Success and error messages
- 🎨 Modern e-commerce styling

---

## 🛠️ Tech Stack

### Backend

- Java
- Spring Boot
- Spring Web / REST API
- Spring Data JPA
- Spring Security
- JWT Authentication
- Hibernate
- Maven

### Frontend

- React
- JavaScript
- HTML5
- CSS3
- Vite

### Database

- MySQL

### Development Tools

- IntelliJ IDEA
- Visual Studio Code
- Git
- GitHub
- Postman

---

## 🏗️ Project Architecture

ShopSphere follows a **full-stack layered architecture**:

```text
                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │                          │
                    │ Products │ Cart │ Orders│
                    │ Login │ Register │ UI    │
                    └────────────┬─────────────┘
                                 │
                              REST API
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Spring Boot API     │
                    │                          │
                    │ Controllers              │
                    │ Services                 │
                    │ Repositories             │
                    │ Security / JWT           │
                    │ Entities                 │
                    └────────────┬─────────────┘
                                 │
                           JPA / Hibernate
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │          MySQL           │
                    │                          │
                    │ Users                    │
                    │ Products                 │
                    │ Cart                     │
                    │ Orders                   │
                    │ Transactions             │
                    └──────────────────────────┘

##📂 Project Structure
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
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Products.jsx
│   │   ├── Products.css
│   │   ├── Orders.jsx
│   │   ├── Orders.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── shibankar/
│       │           └── shopsphere/
│       │               ├── controller/
│       │               ├── service/
│       │               ├── repository/
│       │               ├── entity/
│       │               ├── security/
│       │               └── exception/
│       │
│       └── resources/
│           └── application.properties
│
├── .gitignore
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md


##🔐 Authentication Flow
User
 │
 ▼
Login / Register
 │
 ▼
Spring Security
 │
 ▼
JWT Token Generated
 │
 ▼
Frontend Stores Token
 │
 ▼
Token Sent with API Requests
 │
 ▼
JWT Authentication Filter
 │
 ▼
Protected REST API

##🔍 Product Search & Filtering

ShopSphere provides multiple ways to discover products:

🔎 Search by product name
💰 Minimum price filter
💰 Maximum price filter
📦 In-stock filter
📄 Pagination
🔄 Clear filters
Example:
Search:
Wireless

Minimum Price:
1000

Maximum Price:
5000

In Stock:
✓

##🛒 Shopping Cart Flow
Browse Products
       │
       ▼
Add to Cart
       │
       ▼
View Cart
       │
       ▼
Manage Quantity
       │
       ▼
Calculate Total
       │
       ▼
Place Order

##📦 Order Management
After placing an order, users can access their order history and view their purchased products.
Cart
 │
 ▼
Place Order
 │
 ▼
Order Created
 │
 ▼
Order Stored in Database
 │
 ▼
Orders Page
 │
 ▼
View Order History

##📸 Screenshots

###🔐 Login Page
<img width="1915" height="983" alt="image" src="https://github.com/user-attachments/assets/732ac9db-4d77-402e-a63c-64b40297d015" />

###🏠Home Screen
<img width="1896" height="985" alt="image" src="https://github.com/user-attachments/assets/f5fb4641-b417-4a0e-8ef8-4da7535895e7" />

###🛍️ Products Page
<img width="1888" height="977" alt="image" src="https://github.com/user-attachments/assets/4589239f-f7fd-4072-beec-1b6ebaafd549" />
<img width="1887" height="982" alt="image" src="https://github.com/user-attachments/assets/ea983950-cdbc-4f8d-97a9-b31409b98a7e" />

###🛒 Shopping Cart
<img width="1891" height="981" alt="image" src="https://github.com/user-attachments/assets/e3bfc8d4-e198-4241-b3f1-4a81a12679bc" />

###🛍️Checkout Page
<img width="1896" height="987" alt="image" src="https://github.com/user-attachments/assets/681d4e16-7290-4592-8f16-520614d86596" />

###📦 Orders Page
<img width="1881" height="982" alt="image" src="https://github.com/user-attachments/assets/446b5023-bfb7-46f8-9d22-8c80d8973d76" />

##⚙️ Installation
###1️⃣ Clone the Repository
git clone https://github.com/shibankardas-programmer/ShopSphere.git
cd ShopSphere

###2️⃣ Backend Setup
Make sure the following are installed:

Java 21
Maven
MySQL

Open the project in IntelliJ IDEA or VS Code.

###3️⃣ Create MySQL Database

Open MySQL and create the database:

CREATE DATABASE shopsphere;

###4️⃣ Configure Database

Open:

src/main/resources/application.properties

Configure your MySQL connection:

spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

Replace your_password with your local MySQL password.

###5️⃣ Run the Backend

Using Maven:

mvn spring-boot:run

Or on Windows:

.\mvnw.cmd spring-boot:run

The backend runs on:

http://localhost:8080

###6️⃣ Frontend Setup

Open another terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the React development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🔗 Backend API

The React frontend communicates with the Spring Boot backend through REST APIs.

Base API URL:

http://localhost:8080/api
Main API Areas
/api/auth
/api/products
/api/cart
/api/orders

The frontend sends the JWT token in the request header for protected operations:

Authorization: Bearer <JWT_TOKEN>
🗄️ Database

The application uses MySQL with Spring Data JPA / Hibernate for persistence.

Main application data includes:

Users
Products
Cart
Orders
Transactions
🧪 Testing

The REST APIs can be tested using:

Postman
Browser
React Frontend

Authentication-protected endpoints require a valid JWT token.

##🚀 Future Enhancements

The following features can be added in future versions:

💳 Online Payment Gateway Integration
📧 Email Order Confirmation
❤️ Wishlist
⭐ Product Reviews and Ratings
🏷️ Product Categories
🎟️ Discount Coupons
📊 Admin Dashboard
👨‍💼 Admin Product Management
📦 Advanced Order Tracking
🔔 Real-time Notifications
☁️ Cloud Deployment
📱 Improved Mobile Experience
📚 Learning Outcomes

Through this project, I gained practical experience in:

Building REST APIs using Spring Boot
Developing React-based user interfaces
Implementing JWT authentication
Working with Spring Security
Using Spring Data JPA and Hibernate
Connecting Spring Boot with MySQL
Designing CRUD-based backend systems
Integrating frontend and backend applications
Implementing search and filtering
Managing shopping cart and order workflows
Using Git and GitHub for version control

##👨‍💻 Author

Shibankar Das

🎓 B.Tech Computer Science & Engineering
🏫 Assam down town University

##GitHub

https://github.com/shibankardas-programmer

##LinkedIn

https://www.linkedin.com/in/shibankar-das-916517381

##⭐ If you like this project

If you find this project useful or interesting, please consider giving it a ⭐ on GitHub!

##📄 License

This project was developed for educational and learning purposes as part of a Java Developer Internship project.







