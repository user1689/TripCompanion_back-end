const API_KEY = 'AIzaSyCfZKu84SePg4VStMG5IzN7KARMcmnRobk';
const axios = require('axios');
const HttpError = require('../models/http-error');

async function getCoordsForAddress(address) {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
  const data = response.data;
  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError('Could not find location for the specified address.', 422);
    // return next(new HttpError('Could not find location for the specified address.', 422)); next is not defined
  }
  const coordinates = data.results[0].geometry.location;
  // console.log(coordinates);
  return coordinates;
}

module.exports = getCoordsForAddress;

