const express = require('express')
const router = express.Router();
const { check } = require('express-validator');

const userControllers = require('../controller/users-controller');

router.get('/', userControllers.getUsers);

router.post('/login', userControllers.login)

router.post('/signup',
  [
    check('name').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({min: 6})
  ]
  , userControllers.signup);

module.exports = router;