# ITP project - Food Delivery & E-Commerce Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application designed for seamless food ordering, inventory management, and business administration. This platform features secure payments, real-time order tracking, and a comprehensive admin dashboard for business analytics.

---

##  Key Features

### User Interface (Client Side)
* **Secure Authentication:** User registration and login with JWT encryption.
* **Smart Product Browsing:** Search, filter, and view food items with dynamic categories.
* **Shopping Cart:** Real-time cart management with quantity adjustments.
* **Secure Payments:** Integrated **Stripe** payment gateway for credit/debit card transactions.
* **Order Tracking:** Live status updates on active orders (Preparing, Shipped, Delivered).
* **AI Chatbot:** Intelligent support assistant for instant customer queries.
* **User Dashboard:** Manage profile, view order history, and submit feedback.

### Admin Dashboard (Management Side)
* **Analytics & Reports:** Visual charts (Recharts) for sales data and downloadable reports (PDF/Excel).
* **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for products.
* **Order Management:** Process refunds, update shipping status, and view transaction details.
* **User Management:** View and manage registered users.
* **System Maintenance:** Automated data backups and inquiry handling.
* **Notification System:** Real-time alerts for new orders and system events.

---

## Tech Stack

### **Frontend**
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS & Material UI (@mui/material)
* **State Management:** React Context API
* **HTTP Client:** Axios
* **Data Visualization:** Recharts
* **Payment:** @stripe/react-stripe-js

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JSON Web Token (JWT) & bcryptjs
* **File Storage:** Cloudinary (for product images)
* **Email Service:** Nodemailer
