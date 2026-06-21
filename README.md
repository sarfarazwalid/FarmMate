# FarmMate 🌾

A modern AI-powered agricultural SaaS platform connecting farmers, buyers, and administrators through smart farming tools, marketplace management, automation, and intelligent insights.

---

## 🚀 Overview

FarmMate is a full-stack digital agriculture platform designed to modernize farming operations and agricultural commerce.

The platform provides farmers with AI-assisted farming solutions, inventory management, task automation, analytics, and a direct marketplace where buyers can purchase fresh agricultural products.

FarmMate creates a connected ecosystem between:

- 🌱 Farmers
- 🛒 Buyers
- 👨‍💼 Administrators

---

# ✨ Features

## 🌱 Farmer Features

## Farm Management

- Create and manage farm profiles
- Store farm information and conditions
- Upload farm details
- Track farming activities
- Maintain farm records

---

## Product Management

- Add agricultural products
- Update product details
- Manage inventory
- Manage pricing and availability
- Track product stock
- AI-generated product images for marketplace display

---

## Order Management

- View incoming buyer orders
- Accept and process orders
- Update order status
- Handle order cancellation requests
- Track sales history

---

## 🤖 AI Farming Assistant

FarmMate provides AI-powered agricultural assistance:

- Crop recommendation system
- Pest detection assistance
- Smart farming suggestions
- AI-powered farming insights
- Task prioritization system

---

## 📋 Smart Task Management

Farmers can:

- Create farming tasks
- Assign tasks
- Track task progress
- Manage deadlines
- Prioritize tasks using AI assistance

---

## 📅 Planning Tools

- Planting calendar
- Crop planning assistance
- Farm condition reports
- Farming analytics dashboard

---

## 👥 Farmer Community

- Farmer discussion forum
- Q&A system
- Knowledge sharing
- Community interaction

---

# 🛒 Buyer Features

## Marketplace

Buyers can:

- Browse agricultural products
- Search products
- Filter products
- View farmer products
- View AI-generated product images
- Explore product details

---

## Farmer Discovery

- Browse available farmers
- View farmer profiles
- Explore farmer products
- Connect with agricultural sellers

---

## Shopping System

- Add products to cart
- Update cart items
- Stock validation
- Secure checkout flow

---

## Order System

Buyers can:

- View order history
- Track order status
- Cancel eligible orders
- Receive notifications from farmers

---

# 👨‍💼 Admin Features

Administrators have control over the platform:

- User management
- Farmer management
- Buyer management
- Order monitoring
- Platform analytics
- Q&A moderation
- Audit logging
- System monitoring

---

# 🔐 Authentication & Security

FarmMate implements secure authentication:

- JWT-based authentication
- Password encryption using bcrypt
- Protected API routes
- Role-based access control (RBAC)
- Authorization middleware

Supported roles:

```
Farmer
Buyer
Admin
```

---

# 🤖 AI Integration

FarmMate integrates AI capabilities:

### Crop Intelligence

- Crop recommendation
- Farming suggestions
- Agricultural guidance


### Pest Detection

- Pest identification assistance
- Recommended actions
- Treatment suggestions


### Smart Automation

- AI task prioritization
- Farming workflow optimization


### Product Intelligence

- AI-generated agricultural product images
- Product visualization for buyers

---

# 🛠️ Technology Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Chart.js
- Lucide Icons


## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose


## Authentication

- JWT
- bcrypt


## AI Services

- Google Gemini API
- OpenRouter API

---

# 📁 Project Structure

```text
FarmMate/
│
├── backend/
│
│   ├── config/
│   │   ├── api.js
│   │   └── jwt.js
│   │
│   ├── controllers/
│   │   ├── analytics.controller.js
│   │   ├── auditLog.controller.js
│   │   ├── cart.controller.js
│   │   ├── crop.controller.js
│   │   ├── farm.controller.js
│   │   ├── notification.controller.js
│   │   ├── order.controller.js
│   │   ├── pest.controller.js
│   │   ├── product.controller.js
│   │   ├── qa.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rbac.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── farm.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   ├── task.model.js
│   │   ├── notification.model.js
│   │   └── auditLog.model.js
│   │
│   ├── routes/
│   │   ├── user.route.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── cart.routes.js
│   │   ├── crop.routes.js
│   │   ├── pest.routes.js
│   │   ├── task.routes.js
│   │   └── notification.routes.js
│   │
│   ├── services/
│   │   ├── aiPrioritize.js
│   │   ├── cropFallback.js
│   │   ├── productImageService.js
│   │   └── taskGenerator.js
│   │
│   ├── openRouter.js
│   ├── seedData.js
│   └── server.js
│
│
├── frontend/
│
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── buyer/
│   │   │   └── farmer/
│   │   │
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   ├── page.js
│   │   └── layout.js
│   │
│   ├── components/
│   │
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── Badge.js
│   │   │   ├── AnimatedCard.js
│   │   │   └── KPICard.js
│   │   │
│   │   └── motion/
│   │       ├── MotionSystem.js
│   │       └── motion.js
│   │
│   ├── lib/
│   │   ├── api.js
│   │   └── apiConfig.js
│   │
│   ├── styles/
│   │   └── design-system.js
│   │
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

# 🚀 Installation

## Requirements

Install:

- Node.js
- MongoDB
- npm


---

## Clone Repository

```bash
git clone https://github.com/sarfarazwalid/FarmMate.git

cd FarmMate
```

---

# Backend Setup

```bash
cd backend

npm install
```

Create:

```
.env
```

Add:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_api_key

OPENROUTER_API_KEY=your_api_key
```

Run:

```bash
npm run dev
```

Backend:

```
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create:

```
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

# 🔌 API Modules

Available modules:

- Authentication
- Users
- Farms
- Products
- Marketplace
- Cart
- Orders
- Tasks
- Crop Suggestions
- Pest Detection
- Community
- Q&A
- Analytics
- Notifications

---

# 🏗️ Architecture

FarmMate follows a modern full-stack architecture:

Frontend:

```
Next.js
    ↓
React Components
    ↓
API Layer
    ↓
Backend Services
```

Backend:

```
Express.js
    ↓
Controllers
    ↓
Services
    ↓
MongoDB
```

---

# 🔮 Future Improvements

Planned improvements:

- Mobile application
- Real-time chat
- Payment integration
- Weather intelligence
- IoT farming sensors
- Advanced machine learning models
- Multi-language support
- Smart farming automation

---

# 👨‍💻 Author

**M A Walid**

---

# 🌾 FarmMate

Smart farming powered by:

AI • Automation • Digital Marketplace • Connected Agriculture