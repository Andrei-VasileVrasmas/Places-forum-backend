const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Diablo Caliente",
    email: "test@mail.com",
    password: "123123",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs, please check you data", 422);
  }

  const { name, email, password } = req.body;

  const userExits = DUMMY_USERS.find((u) => u.email === email);
  if (userExits) {
    throw new HttpError("Email allready in use", 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("User does not exist, invalid credentials", 401);
  }

  res.json({ message: "Login Success" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
