const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const errorHandler = require('./src/middlewares/errorHandler');

// Routes Importing
const industryRoutes = require('./src/routes/industry.routes');
const sectorRoutes = require('./src/routes/sector.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/industry', industryRoutes);
app.use('/api/sectors', sectorRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
