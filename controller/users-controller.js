const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const uuid = require('uuid');

const DUMMY_USERS = [
  {
    uid: 'u1',
    name: 'sam',
    email: '123@gmail.com',
    password: '123321'
  },
]

const getUsers = (req, res, next) => {
  return res.json({users: DUMMY_USERS});
}

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const {name, email, password} = req.body;
  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError('Could not create user, email already exists.', 422);
  }

  const newUser = {
    uid: uuid.v4(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(newUser);

  return res.status(201).json({user: newUser});

}

const login = (req, res, next) => {
  const {email, password} = req.body;
  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Could not find identify user, credentials seem to be wrong.', 401);
  }
  res.json({message: 'Logged in'})
}

module.exports = {getUsers, signup, login};