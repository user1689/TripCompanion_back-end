const express = require('express');
const placesControllers = require('../controller/places-controller');
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth')
const router = express.Router();


router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post('/',
  fileUpload.single('image'),
  [
  check('title').not().isEmpty(),
  check('description').isLength({ min: 5 }),
  check('address').not().isEmpty(),
  ]
  , placesControllers.createPlace);

router.post('/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ]
  , placesControllers.updatePlaceById);

router.delete('/:pid', placesControllers.deletePlaceById);

module.exports = router;