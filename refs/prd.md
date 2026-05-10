# Product Requirements Document (PRD)
## Project Name: Majelis Ilmu (Community & E-Commerce Platform)

### 1. Overview
Majelis Ilmu is an integrated web application serving as a central hub for an Islamic community. It provides ticketing for study sessions (Kajian) and an e-commerce store for Islamic merchandise. The platform consists of a main user-facing application and a dedicated admin panel.

### 2. Objectives
- Provide a seamless, zero-delay experience for users browsing events and products.
- Simplify event ticketing and merchandise purchasing.
- Automate WhatsApp notifications for successful registrations, orders, and payment reminders.
- Centralize management for administrators via a unified dashboard.

### 3. Key Features
#### 3.1 Main Application (User Facing)
- **Home & Dashboard:** Overview of upcoming events and featured products.
- **Kajian (Events) Module:** View event details, filter by category, register (free/infaq/paid), and track remaining quotas.
- **Shop Module:** Browse merchandise, view discounts, and add items to the cart.
- **Cart & Checkout:** Manage cart items, select payment methods (QRIS, VA, E-Wallet, Manual Transfer), and receive simulated success notifications. We will use midtrans and xendit for the pamyments
- **User Profile:** View active tickets, order history, payment methods, and notification preferences.

#### 3.2 Admin Panel (Path: `/panel`)
- **Admin Dashboard:** High-level metrics (Total Revenue, Pending Orders, Total Events, Total Products) with charting capabilities.
- **Event Management:** CRUD operations for Kajian schedules.
- **Product Management:** CRUD operations for merchandise inventory.
- **Order Management:** Track and update order statuses (Pending, Packed, Shipped, Completed).
- **Settings:** Configure WhatsApp API templates and Bank Account details.

### 4. Non-Functional Requirements
- **Extreme Performance:** Page transitions and data loading must have zero perceivable delay.
- **Responsiveness:** Fully optimized for Mobile, Tablet, and Desktop views.
- **Image Optimization:** All images must be aggressively cached and optimized.
