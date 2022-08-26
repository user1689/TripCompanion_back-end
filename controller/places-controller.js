const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/locations');
const uuid = require('uuid');

let DUMMY_PLACES = [
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

const getPlacesById = (req, res, next) => {
  let placeId = req.params.pid;
  const places =  DUMMY_PLACES.filter((place) => {
    return place.pid === placeId;
  });
  if (places === null || places.length === 0) {
    throw new HttpError('Could not find a places for the provided pid.', 404);
  }
  console.log("get request in places");
  res.json({places}); // {places} => {places: places}
};


const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((place) => {
    return place.creator === userId;
  })
  if (places === null || places.length === 0) {
    return next(new HttpError('Could not find places for the provided uid.', 404));
  }
  res.json({places}); 
};

const createPlace = async (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const {title, description, address, creator} = req.body;
  // if (title.trim().length === 0) {
    
  // }
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  
  const newPlace = {
    pid: uuid.v4,
    title,
    address,
    description, 
    location: coordinates, 
    creator
  };
  DUMMY_PLACES.push(newPlace);
  res.status(201).json({place: newPlace});
}

const updatePlaceById = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }
  const {title, description} = req.body;
  const pid = req.params.pid;
  console.log(pid);
  const place = DUMMY_PLACES.find((place) => {
    return place.pid === pid;
  });
  // console.log(place);
  // console.log(DUMMY_PLACES[0]);
  // console.log(place === DUMMY_PLACES[0]);
  const updatedPlace = {...DUMMY_PLACES.find(p => p.pid === pid)};
  updatedPlace.title = title;
  updatedPlace.description = description;
  // console.log(updatedPlace);
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id == pid);
  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({place: updatedPlace});
}

const deletePlaceById = (req, res, next) => { 
  const { title, description } = req.body;
  const pid = req.params.pid;
  if (!DUMMY_PLACES.find(p => p.pid === pid)) {
    return new HttpError('Could not find a place for that id', 404);
  } 
  DUMMY_PLACES = DUMMY_PLACES.filter((place) => { 
    return place.pid !== pid;
  });
  res.status(200).json({message: 'Deleted place'});
}

// console.log(arguments.callee+'');

module.exports = {getPlacesById, getPlacesByUserId, createPlace, updatePlaceById, deletePlaceById};