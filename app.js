const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const errorHandler = require('./src/middlewares/errorHandler');

// routes importing
const authRoutes = require('./src/routes/auth.routes');
const dashRoutes = require('./src/routes/dashboard.routes');
const industryRoutes = require('./src/routes/industry.routes');
const sectorRoutes = require('./src/routes/sector.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// connect to DB
connectDB();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/dash', dashRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/sectors', sectorRoutes);

// error handler middleware
app.use(errorHandler);

// server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// /ILERNA
// │
// ├── /config
// │   └── db.js
// │
// ├── /node_modules
// │
// ├── /src
// │   ├── /controllers
// │   │   ├── industry.controller.js
// │   │   ├── sector.controller.js
// │   │   ├── userController.js
// │   │
// │   ├── /middlewares
// │   │   └── errorHandler.js
// │   │
// │   ├── /model
// │   │   ├── industry.model.js
// │   │   ├── sector.model.js
// │   │   ├── user.js
// │   │
// │   ├── /routes
// │   │   ├── industry.routes.js
// │   │   ├── sector.routes.js
// │   │   ├── userRoutes.js
// │
// ├── .env
// ├── .gitignore
// ├── app.js
// ├── package-lock.json
// └── package.json
