const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user.js");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (e) {
    const error = new HttpError(
      "Could not get users, please try again later...",
      500
    );
    return next(error);
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs, please check you data", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const error = new HttpError(
      "Singing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("Users allready exists, please login", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    const error = new Error(
      "Could not create user, please try again later",
      500
    );
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError(
      "Signup failed, please try again later...",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secret_key_dont_share",
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError(
      "Signup failed, please try again later...",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const error = new HttpError("Login failed, please try again later", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, please try again...",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    const error = new HttpError(
      "Could not log you in, please check the credentials...",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, please check your inputs....",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "secret_key_dont_share",
      { expiresIn: "1h" }
    );
  } catch (e) {
    const error = new HttpError("Login failed, please try again later...", 500);
    return next(error);
  }
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
