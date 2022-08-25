const HttpError = require('../models/http-error')
const uuid = require('uuid');

const dummy_places = [
  {
    pid: 'p1',
    title: 'xxxxxxx',
    description: 'xxxxxxxxx',
    location: {
      lat: 55,
      lng: -12
    },
    address: 'xxxxxxxxxx',
    creator: 'u1'
  }
]

const getPlaceById = (req, res, next) => {
  let placeId = req.params.pid;
  const place =  dummy_places.filter((place) => {
    return place.pid === placeId;
  });
  if (place === null || place.length === 0) {
    throw new HttpError('Could not find a place for the provided pid.', 404);
  }
  console.log("get request in places");
  res.json({place}); // {places} => {places: places}
};


const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = dummy_places.filter((place) => {
    return place.creator === userId;
  })
  if (place === null || place.length === 0) {
    return next(new HttpError('Could not find a place for the provided uid.', 404));
  }
  res.json({place}); 
};

const createPlace = (req, res, next) => {
  const {title, description, coordinates, address, creator} = req.body;
  const newPlace = {
    pid: uuid.v4,
    title,
    address,
    description, 
    location: coordinates, 
    creator
  };
  dummy_places.push(newPlace);
  res.status(201).json({place: newPlace});
}

const updatePlaceById = (req, res, next) => {
  const { title, description} = req.body;
  const pid = req.params.pid;
  const place = dummy_places.find((place) => {
    place.pid = pid;
  });
  place.title = title;
  place.description = description;
  res.status(201).json({place: place});
}

const deletePlaceById = (req, res, next) => {
  const { title, description} = req.body;
  const pid = req.params.pid;
  const place = dummy_places.find((place) => {
    place.pid = pid;
  });
  res.status(201).json({place: place});
}


// console.log(arguments.callee+'');

module.exports = {getPlaceById, getPlaceByUserId, createPlace, updatePlaceById, deletePlaceById};