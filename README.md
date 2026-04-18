# CampusBuy - Campus Marketplace & Lost and Found

CampusBuy is a modern, full-stack MERN application designed specifically for college campuses. It provides a centralized, secure platform for students to buy, sell, and trade items, along with a dedicated module for reporting and finding lost items with location-awareness.

## Key Features

- **Robust Authentication**: Secure user registration and login with OTP verification, password recovery, and JWT-based session management.
- **Campus Marketplace**: Browse, search, filter, and list products easily. Features include product favorites, detailed item views, and user activity history.
- **Location-Aware Lost & Found**: A specialized module to report lost or found items, featuring an interactive map view (integrated with OpenStreetMap), geolocation capture, and AI-enhanced item matching.
- **Real-Time Communication**: Built-in chat system powered by Socket.io, allowing seamless, instant communication between buyers and sellers.
- **Admin Moderation Panel**: Comprehensive dashboard for platform administrators to monitor activity, manage users, and moderate listings.
- **Premium User Interface**: A beautifully crafted, fully responsive frontend utilizing React, Vite, TailwindCSS v4, and Framer Motion. The UI features a cohesive glassmorphism aesthetic, smooth micro-animations, and dynamic interactions.
- **Profile Management**: Dedicated dashboards for users and sellers to manage their listings, chats, and account settings.

## Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **Styling**: TailwindCSS 4
- **State Management**: Redux Toolkit, Redux Persist
- **Animations**: Framer Motion
- **Real-Time**: Socket.io Client
- **Icons**: Lucide React, React Icons
- **3D Graphics (Optional/Enhancements)**: Three.js, React Three Fiber

### Backend
- **Server**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-Time Engine**: Socket.io
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Media Storage**: Cloudinary, Multer
- **Email Services**: Nodemailer

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cluster)
- [Cloudinary Account](https://cloudinary.com/) (For image hosting)

### Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd CampusBuy
   ```

2. **Backend Setup**:
   Navigate to the Backend directory and install dependencies:
   ```bash
   cd Backend
   npm install
   ```
   Create a `.env` file in the `Backend` directory and add the necessary environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   Open a new terminal window, navigate to the Frontend directory, and install dependencies:
   ```bash
   cd Frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## Project Structure

- `Frontend/` - Client-side React application.
  - `src/components/` - Reusable UI elements and layout components.
  - `src/page/` - Main application pages (Home, Login, LostFound, ProductDetails, etc.).
  - `src/utils/` - Helper functions and utility constants.
  - `src/assets/` - Static assets and global CSS.
- `Backend/` - Server-side Node.js application.
  - `models/` - Mongoose database schemas.
  - `routes/` - Express API route definitions.
  - `controllers/` - Business logic and request handling.
  - `middleware/` - Custom middleware for authentication, file uploads, etc.
  - `config/` - Database and service configurations.