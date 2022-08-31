const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/locations');
// const uuid = require('uuid');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs');


// let DUMMY_PLACES = [
//   {
//     pid: 'p1',
//     title: 'xxxxxxx',
//     description: 'xxxxxxxxx',
//     location: {
//       lat: 55,
//       lng: -12
//     },
//     address: 'xxxxxxxxxx',
//     creator: 'u1'
//   }
// ]

const getPlaceById = async (req, res, next) => {
  let placeId = req.params.pid;

  let place = null;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }

  if (place === null || place.length === 0) {
    return next(new HttpError('Could not find places for the provided uid.', 404));
  }
  console.log("get request in places");
  // mongoose adds id getters to every document which returns the id as a string, 
  // but because we call toObject, the getters method will lost, but we can add `{getters: true}` to tell mongoose to add an id property
  // to the created object
  res.json({ place: place.toObject({ getters: true }) }); // {places} => {places: places}
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places = null;
  // try {
  //   places = await Place.find({
  //     creator: userId
  //   });
  // } catch (error) {
  //   return next(new HttpError('Something went wrong, could not find a place', 500));
  // }
  let userWithPlaces = null;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }

  // if (places === null || places.length === 0) {
  //   return next(new HttpError('Could not find places for the provided uid.', 404));
  // }
  if (userWithPlaces === null || userWithPlaces.places.length === 0) {
    return next(new HttpError('Could not find places for the provided uid.', 404));
  }
  res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator
  });

  let user = null
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError('Could not find user for provided id, please try again', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id, please try again', 404));
  }

  console.log(user);

  // DUMMY_PLACES.push(newPlace);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({session: sess});
    user.places.push(newPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  res.status(201).json({ place: newPlace });
}

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place = null;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place.', 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError('Updating place failed, please try again.', 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });

}

const deletePlaceById = async (req, res, next) => {
  
  const placeId = req.params.pid;

  let place = null;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id', 500);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place.', 401));
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session: sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();

  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500));
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  })

  res.status(200).json({ message: 'Deleted place.' });
}

// console.log(arguments.callee+'');

module.exports = { getPlaceById, getPlacesByUserId, createPlace, updatePlaceById, deletePlaceById };