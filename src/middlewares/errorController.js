const AppErr = require('./appErr');

const handleErrDBCast = (err) => {
  const message = `The value you enterd is invalid ${err.path}`;
  return new AppErr(message, 400);
};
const handleDuplicateFeildDB = (err) => {
  // const value = Object.keys(err.keyValue)[0];
  const error = Object.keys(err.keyPattern);

  const message = `This ${error} is already used , try another one...`;
  return new AppErr(message, 400);
};

const handleJwt = (err) => {
  const message = `invalid login, please login again, ${err.name}`;
  return new AppErr(message, 401);
};
const handleJwtExpiration = () => {
  const message = `login is expired ,please login again`;
  return new AppErr(message, 401);
};

const handleValidationDB = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = error.join(' ,');
  return new AppErr(message, 400);
};

const sendErrProduction = (err, res) => {
  //  operatinoal , trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log error
    console.error('Error ❌', err);

    // send generic message

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
  }
};
const sendErrDevelpment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    sendErrDevelpment(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    // let err = JSON.parse(JSON.stringify(err))
    let error = { ...err }
    if (error.name === 'CastError') error = handleErrDBCast(error); //for requesting wrong id
    if (error.code === 11000) error = handleDuplicateFeildDB(error); // post the same name of tour
    if (error.name === 'ValidationError') error = handleValidationDB(error); //vlidtion error
    if (error.name === 'JsonWebTokenError') error = handleJwt(); //vlidtion error
    if (error.name === 'TokenExpiredError') error = handleJwtExpiration(); // err expiration time for the token
    sendErrProduction(error, res);
  }
};