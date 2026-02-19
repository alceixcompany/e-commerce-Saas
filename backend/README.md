# E-commerce Backend

Node.js backend API for e-commerce application.

## Installation

```bash
npm install
```

## Running the Server

### Development mode (with nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
NODE_ENV=development
```

## API Endpoints

- `GET /` - API welcome message
- `GET /api/health` - Health check endpoint

## Project Structure

```
backend/
├── src/
│   ├── index.js              # Main server file
│   ├── routes/
│   │   ├── index.js          # Health check routes
│   │   └── api.js            # Main API routes
│   └── middleware/
│       ├── errorHandler.js   # Error handling middleware
│       └── notFound.js       # 404 handler middleware
├── .env                      # Environment variables (create this file)
├── .gitignore                # Git ignore file
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```


