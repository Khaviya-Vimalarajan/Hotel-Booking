# Emerald Resorts  — Hotel Booking & Resort Management System

An enterprise-ready, boutique Hotel Booking & Resort Management System built using **Spring Boot 3 (Java 21)**, **React (Vite + Tailwind CSS)**, and **MySQL**.

This system features a high-end luxury brand aesthetic (Deep Emerald `#0F6E5C` / Warm Terracotta `#C2703D`, Playfair serif typography, glassmorphism, and Framer Motion transitions) suitable for premium hospitality brands.

---

## 🌟 Tech Stack & Infrastructure

### Backend
- **Core Framework:** Spring Boot 3.3.0, Java 21
- **Database Access:** Spring Data JPA, Hibernate, MySQL 8.0+
- **Security:** Spring Security (Stateless JWT token authentication, Refresh Tokens, BCrypt password hashing)
- **Utilities:** Lombok, ModelMapper, Jakarta Validation API
- **Base Port:** `8080`

### Frontend
- **Framework:** React.js 18 (Vite SPA)
- **Styling:** Tailwind CSS (with bespoke brand themes and glassmorphic blur layers)
- **Animation:** Framer Motion (animated layout transitions and interactive modals)
- **Visualizations:** Recharts (KPI graphs, monthly revenue plots, occupancy rates)
- **Networking:** Axios client (with interceptors to auto-inject and refresh JWT headers)
- **Base Port:** `5173`

---

## 📂 Project Directory Structure

```
Hotel-booking/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/luxury/hotel/
│           │   ├── config/          # CORS, Security, Seeder configurations
│           │   ├── controller/      # Auth, Hotel, Rooms, Bookings, Analytics
│           │   ├── dto/             # Request & Response Transfer Mappings
│           │   ├── entity/          # JPA Entities mapping to MySQL tables
│           │   ├── exception/       # ResourceNotFound, OverlapBooking Exceptions
│           │   ├── repository/      # Spring Data Repositories
│           │   ├── security/        # JWT Utils, Filter, Session Details
│           │   ├── service/         # Business Logic Layer interfaces
│           │   └── ResortManagementApplication.java
│           └── resources/
│               └── application.properties
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProtectedRoute guards
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── pages/           # Home, Details, Checkout Wizard, Dashboards
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── index.html
├── docs/
│   ├── database_schema.sql  # Complete MySQL tables schema
│   └── diagrams.md          # ERD, Use Case, Class, and Sequence Diagrams
└── README.md
```

---

## 🔑 Default User Accounts

The database is pre-seeded with three roles on startup for instant dashboard review:

| Role | Username (Email) | Password | Profile Description |
|---|---|---|---|
| **Administrator** | `admin@luxury.com` | `admin123` | Victoria Sterling (Console Manager) |
| **Hotel Staff** | `staff@luxury.com` | `staff123` | Julian Mercer (Reception Front Desk) |
| **Customer** | `customer@luxury.com` | `customer123` | Eleanor Vance (Preferred Club Member) |

---

## 🚀 Setup & Launch Instructions

### 1. Database Setup
1. Create a MySQL database named `luxury_resort_db`.
2. (Optional) Run the SQL schema in [database_schema.sql](file:///c:/Users/khavi/OneDrive/Desktop/Hotel-booking/docs/database_schema.sql) directly on your MySQL instance. Spring Boot Hibernate will also auto-update and initialize tables on startup.

### 2. Launching the Backend
1. Open a terminal in the `backend/` directory.
2. Build the project using Maven:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The server starts on `http://localhost:8080` and seeds the database automatically.*

### 3. Launching the Frontend
1. Open a terminal in the `frontend/` directory.
2. Install Node packages:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`.*
