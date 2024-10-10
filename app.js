const express = require('express');
const pug = require('pug')
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes')

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1] MIDDLEWARE

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.7/axios.min.js'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      upgradeInsecureRequests: [],
    },
  })
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// HTTP pollution parameter
app.use(hpp({
  whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));

// app.use((req, res, next) => {
//   console.log('Hello from Middleware 👋');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Leaflet - Map Integration
// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/leaflet@1.9.4/dist/leaflet.css https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
//   next();
// })

//3] ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


// app.all('*', (req, res, next) => {
//   // res.status(404).json({
//   //   status: "fail",
//   //   message: `Can't find ${req.originalUrl} on this server!`
//   // })

//   const err = new Error(`Can't find ${req.originalUrl} on this server!`);
//   err.statusCode = 404;
//   err.status = 'fail';

//   next(err);
// })

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message
//   })
// })

app.use(globalErrorHandler);

module.exports = app;
