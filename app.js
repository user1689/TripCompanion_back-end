const express = require('express')
const bodyParser = require('body-parser')
const placesRoutes = require('./routes/places-routes')
const userRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')


const app = express()
const port = 5999

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
}) 

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({message: error.message || "an unknown error happened!"})
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))