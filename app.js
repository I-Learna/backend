const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const AppErr = require('./src/middlewares/appErr');
const errorController = require('./src/middlewares/errorController');

// routes importing
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const dashRoutes = require('./src/routes/dashboard.routes');
const industryRoutes = require('./src/routes/industry.routes');
const sectorRoutes = require('./src/routes/sector.routes');
const couponRoutes = require('./src/routes/coupon.routes');
const videoRoutes = require('./src/routes/video.routes');
const questionRoutes = require('./src/routes/question.routes');
const ebookRoutes = require('./src/routes/ebook.routes');
const courseRoutes = require('./src/routes/course.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// express-session middleware
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true in prod(HTTPS)
  })
);
// connect to DB
connectDB();

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dash', dashRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/video', videoRoutes);
app.use('/api', questionRoutes);
app.use('/api/ebook', ebookRoutes);
app.use('/api/course', courseRoutes);

// error handler middleware
app.all('*', (req, res, next) => {
  next(new AppErr(`cannot find this ${req.originalUrl} on the server`, 404));
});

app.use(errorController);

// Global error handler
// add next as a parameter
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.message || 'Something went wrong!',
  });
});
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
