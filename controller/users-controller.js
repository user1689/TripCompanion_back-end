const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  return res.json({ users: users.map(user => user.toObject({ getters: true })) });
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Could not create user, please try again.', 500));
  }

  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Signing up failed, please try again later.', 422));
  }

  // generate token
  let token;

  try {
    token = jwt.sign({ userId: newUser.id, email: newUser.email }, 'bestkey', { expiresIn: '1h' });
  } catch (error) {
    return next(new HttpError('Signing up failed, please try again later.', 422));
  }

  // return res.status(201).json({ user: newUser.toObject({ getters: true }) });
  return res.status(201).json({ userId: newUser.id, email: newUser.email, token: token });

}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser = null;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Logging up failed, please try again later.', 422));
  }

  if (!existingUser) {
    return next(new HttpError('Could not find identify user, credentials seem to be wrong.', 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(new HttpError('Could not log you in, please check your credentials and try again.'), 500);
  }

  if (!isValidPassword) {
    return next(new HttpError('Password error, please try again.', 403));
  }

  // if (existingUser.password !== password) {
  //   return next(new HttpError('Password error, please try again.', 401));
  // }

  let token;
  try {
    token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'bestkey', { expiresIn: '1h' });
  } catch (error) {
    return next(new HttpError('Logging up failed, please try again later.', 422));
  }

  res.json({ userId: existingUser.id, email: existingUser.email, token: token });
}

module.exports = { getUsers, signup, login };