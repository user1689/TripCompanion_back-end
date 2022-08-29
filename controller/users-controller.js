const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');
// const uuid = require('uuid');

// const DUMMY_USERS = [
//   {
//     uid: 'u1',
//     name: 'sam',
//     email: '123@gmail.com',
//     password: '123321'
//   },
// ]

const getUsers = async (req, res, next) => {
  let users = null;
  try {
     users = await User.find({}, '-password');
  } catch (error) {
    return next(new HttpError('Fetching users failed, please try again later.', 500));
  }
  
  return res.json({ users: users.map(user => user.toObject( {getters: true} ))});
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { name, email, password } = req.body;

  let hasUser
  try {
    hasUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Signing up failed, please try again later.', 422));
  }

  if (hasUser) {
    return next(new HttpError('Could not create user, email already exists.', 422));
  }

  const newUser = new User({
    name,
    email,
    image: 'xxxxxxx',
    password,
    places: []
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Signing up failed, please try again later.', 422));
  }

  return res.status(201).json({ user: newUser.toObject({ getters: true }) });

}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Logging up failed, please try again later.', 422));
  }

  if (!existingUser) {
    return next(new HttpError('Could not find identify user, credentials seem to be wrong.', 401));
  }
  if (existingUser.password !== password) {
    return next(new HttpError('Password error, please try again.', 401));
  }

  res.json({ message: 'Logged in', user:  existingUser.toObject( { getters: true }) });
}

module.exports = { getUsers, signup, login };