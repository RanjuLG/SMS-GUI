# 📊 SMS - Sales Management System

> A comprehensive, modern web-based solution for Gold & Jewelry Pawn Shop Management

[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)

---

## 🌟 Overview

**SMS** (Sales Management System) is a professional web application designed specifically for gold and jewelry pawn shop businesses. It streamlines operations from customer management to financial reporting, offering a complete digital solution for your business needs.

![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

---

## ✨ Key Features

### 👥 Customer Management

- Complete customer profile management with NIC verification
- Digital storage of customer NIC photos for security
- Quick customer lookup and advanced search capabilities
- Comprehensive customer activity tracking

### 💎 Item & Inventory Management

- Detailed jewelry and gold item cataloging
- Precise weight and caratage tracking
- Item valuation and pricing calculations
- Customer-item relationship tracking

### 💰 Transaction Processing

- Multi-item pawn transactions
- Real-time interest rate calculations
- Transaction history with full audit trail
- Bulk transaction management

### 📄 Invoice Generation

- Automated invoice generation with PDF export
- Multiple invoice types (Initial, Installment, Settlement)
- Configurable invoice settings
- Customer-specific invoice retrieval

### 🏦 Loan Management

- Flexible loan period configurations
- Installment payment tracking
- Settlement status monitoring
- Automated interest calculation

### 💵 Dynamic Pricing

- Karat-based pricing configuration (18K, 22K, 24K, etc.)
- Loan period-based pricing matrix
- Price per gram calculations
- Customizable loan periods

### 📊 Reports & Analytics

- Business overview dashboards
- Transaction analytics
- Financial summaries
- System health monitoring

### 👤 User Management

- Role-based access control (Admin, Cashier, Manager)
- Secure JWT authentication
- User activity tracking
- Multi-user support

### 💼 Cashier Mode

- Dedicated cashier interface
- Streamlined transaction processing
- Cash balance tracking
- Quick customer and item lookup

---

## 🛠️ Tech Stack

| Technology           | Version | Purpose                    |
| -------------------- | ------- | -------------------------- |
| **Angular**          | 18.x    | Frontend Framework         |
| **TypeScript**       | 5.4     | Programming Language       |
| **Tailwind CSS**     | 3.4     | Utility-first CSS          |
| **Bootstrap**        | 5.3     | UI Components              |
| **Angular Material** | 18.x    | Material Design Components |
| **Chart.js**         | 4.x     | Data Visualization         |
| **RxJS**             | 7.8     | Reactive Programming       |

### Additional Libraries

- **ng2-charts** - Angular wrapper for Chart.js
- **ngx-pagination** - Pagination component
- **jsPDF** - PDF generation
- **xlsx** - Excel export capabilities
- **SweetAlert2** - Beautiful alerts
- **Remixicon** - Icon library

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 18.x

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RanjuLG/SMS-GUI.git
   cd SMS-GUI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm start
   ```

   Or using Angular CLI:

   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

---

## 📋 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm start`     | Start development server |
| `npm run build` | Build for production     |
| `npm run watch` | Build with watch mode    |
| `npm test`      | Run unit tests           |

---

## 📁 Project Structure

```
SMS-GUI/
├── src/
│   ├── app/
│   │   ├── Components/          # UI Components
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── customer-form/   # Customer management
│   │   │   ├── item-form/       # Item management
│   │   │   ├── invoice-form/    # Invoice generation
│   │   │   ├── transaction-history/
│   │   │   ├── reports/         # Analytics & reports
│   │   │   ├── pricing/         # Pricing configuration
│   │   │   ├── user-management/ # User admin
│   │   │   └── ...
│   │   ├── Services/            # API & business services
│   │   ├── shared/              # Shared modules & utilities
│   │   └── core/                # Core functionality
│   ├── assets/                  # Static assets
│   └── styles/                  # Global styles
├── public/                      # Public assets
├── Documents/                   # Project documentation
└── ...
```

---

## 🎨 Features Overview

### Dashboard

- Real-time business metrics
- Quick action shortcuts
- Recent transactions overview
- System health indicators

### Dark/Light Theme

- Seamless theme switching
- Consistent design across modes
- User preference persistence

### Responsive Design

- Mobile-friendly interface
- Tablet optimization
- Desktop-first experience

---

## 🔧 Configuration

The application can be configured through:

- **Configuration Settings Component** - Business settings, API endpoints
- **Pricing Configuration** - Karat values, loan periods, pricing matrix
- **User Management** - Role assignments, permissions

---

## 🔗 Related Repositories

- **Backend API**: SMS-API (ASP.NET Core backend)

---

## 📝 Documentation

Additional documentation can be found in the `Documents/` folder:

- Status Summary
- Backend API User Profile documentation

---

## 👨‍💻 Author

**Ranju Gamage**

- GitHub: [@RanjuLG](https://github.com/RanjuLG)

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- All contributors and testers

---

<p align="center">
  <strong>SMS - Smart. Modern. Secure.</strong>
  <br>
  <em>Streamline your pawn shop operations with SMS</em>
</p>
