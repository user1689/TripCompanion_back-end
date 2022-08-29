const express = require('express');
const placesControllers = require('../controller/places-controller');
const { check } = require('express-validator');

const router = express.Router();


router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.post('/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ]
  , placesControllers.createPlace);

router.patch('/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ]
  , placesControllers.updatePlaceById);

router.delete('/:pid', placesControllers.deletePlaceById);

module.exports = router;