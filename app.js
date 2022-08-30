const express = require('express')
const bodyParser = require('body-parser')
const placesRoutes = require('./routes/places-routes')
const userRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose');


const app = express()
const port = 5999

app.use(bodyParser.json());

// add header to solve Cross original resource sharing
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, OPTIONS, PUT, DELETE");
  next();
})

app.use('/api/places', placesRoutes);
app.use('/api/users', userRoutes);

// handle can not find route error precisely
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
})

// default global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "an unknown error happened!" });
});

// connect to mongoose and listen to port
mongoose
  .connect('mongodb+srv://admin:admin@cluster0.kfd1g7t.mongodb.net/mern?retryWrites=true&w=majority')
  .then(() => {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
  })
  .catch(error => {
    console.log(error);
  })