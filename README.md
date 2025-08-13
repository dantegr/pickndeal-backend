# PicknDeal Backend

Node.js/Express backend with MongoDB for the PicknDeal application.

## Features

- JWT Authentication
- Phone number based OTP verification
- User role management
- MongoDB with Mongoose ODM
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env` file and update values as needed
- Make sure to change `JWT_SECRET` in production

3. Ensure MongoDB is running:
```bash
# If using local MongoDB
mongod
```

4. Seed the database with initial data:
```bash
npm run seed
```

## Running the Application

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication Endpoints

- `POST /api/getOtp` - Get OTP for phone number
- `POST /api/verify` - Verify OTP
- `POST /api/loginWithPassword` - Login with phone and password
- `GET /api/getUserTypes` - Get available user types
- `POST /api/submitUserDetail` - Submit user details (Protected)
- `POST /api/submitUserRoles` - Submit user roles (Protected)
- `GET /api/getUser` - Get user details (Protected)
- `POST /api/resetPassword` - Reset password (Protected)
- `POST /api/updateGeneralProfileData` - Update profile (Protected)
- `POST /api/logout` - Logout user (Protected)

### Other Endpoints (Placeholders)

All other endpoints are created as placeholders and return a "To be implemented" message. These include:
- Category endpoints
- Product endpoints
- Service endpoints
- Order endpoints
- User management endpoints

## Testing Authentication

1. Get OTP:
```bash
curl -X POST http://localhost:3001/api/getOtp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "1234567890"}'
```

2. Verify OTP (use the verification_code from step 1):
```bash
curl -X POST http://localhost:3001/api/verify \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "1234567890", "verification_code": "1234"}'
```

3. Use the token from step 2 for protected routes:
```bash
curl -X GET http://localhost:3001/api/getUser \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
pickndeal-backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── server.js        # Entry point
└── package.json     # Dependencies
```

## Security Notes

- Change `JWT_SECRET` in production
- Implement rate limiting for OTP requests
- Add input validation and sanitization
- Implement proper error logging
- Use HTTPS in production
- Implement CORS properly for production


start monog locally:
net start MongoDB
