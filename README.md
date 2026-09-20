
# MERZADO — B2B RFQ Marketplace

A full-stack B2B marketplace where buyers can publish Requests for Quotation (RFQs) and suppliers can browse opportunities and submit quotations.

## Live Demo

- **Frontend:** https://merzado-rfq-marketplace-two.vercel.app/
- **Backend:** https://merzado-rfq-marketplace-1h5z.onrender.com
- **GitHub:** https://github.com/GauravSampath/merzado-rfq-marketplace

## Features

### Authentication and Roles
- User registration and login
- Password hashing
- JWT-based authentication
- Buyer and supplier roles with role-based access control

### Buyer
- Create, view, edit, and delete RFQs
- Specify the RFQ title, type, description, quantity, delivery location, and deadline
- View quotations submitted for the buyer's RFQs

### Supplier
- Browse available RFQs
- Search and filter RFQs
- View RFQ details
- Submit a quotation with price, estimated delivery time, and notes
- View previously submitted quotations

### Application
- Persistent MongoDB storage
- Protected REST API endpoints
- Input validation and error handling
- Loading, empty, and error states
- Responsive React interface

## Technology Stack

**Frontend**
- React
- Vite
- Axios
- React Router
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

**Deployment**
- Vercel — frontend
- Render — backend
- MongoDB Atlas — database

## Architecture

The React frontend sends HTTP requests to the Express REST API. The API authenticates users, checks their roles and permissions, validates requests, and reads or writes data through Mongoose in MongoDB.

```text
Buyer / Supplier
       |
       v
React + Vite Frontend
       |
       | HTTP / REST API
       v
Node.js + Express Backend
       |
       | Mongoose
       v
MongoDB Atlas
```

## Local Setup

### Prerequisites

- Node.js and npm
- A MongoDB database, such as MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone https://github.com/GauravSampath/merzado-rfq-marketplace.git
cd merzado-rfq-marketplace
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Use your own MongoDB connection string and secret. Do not commit the `.env` file.

Start the backend:

```bash
npm start
```

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign and verify JWTs |
| `PORT` | Backend | Server port; the deployment platform can provide this |
| `VITE_API_URL` | Frontend | Base URL for the backend API, including `/api` |

Never commit credentials, database connection strings, or private secrets.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/rfqs` | Browse RFQs |
| GET | `/api/rfqs/my` | View the buyer's RFQs |
| POST | `/api/rfqs` | Create an RFQ |
| PUT | `/api/rfqs/:id` | Update an RFQ |
| DELETE | `/api/rfqs/:id` | Delete an RFQ |
| POST | `/api/quotations/:rfqId` | Submit a quotation |
| GET | `/api/quotations/my/submitted` | View the supplier's quotations |
| GET | `/api/quotations/rfq/:rfqId` | View quotations for a buyer-owned RFQ |

Protected endpoints require authentication and enforce role or ownership restrictions where applicable.

## Assumptions and Limitations

- Users register with either the buyer or supplier role.
- A supplier can submit at most one quotation per RFQ.
- Buyers can manage their own RFQs and view quotations for those RFQs.
- Suppliers can browse RFQs and manage their submitted-quotation view.
- Email verification and password-reset functionality are not included.
- The application is a mini marketplace project and does not include a payment or order-processing workflow.

## Author

**Gaurav Sampath**

- GitHub: https://github.com/GauravSampath
- LinkedIn: https://linkedin.com/in/gaurav-sampath