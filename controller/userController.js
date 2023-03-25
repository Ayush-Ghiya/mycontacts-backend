const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Desc-->Register a user
//EndPoint --> POST api/users/register
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All field are required");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered!");
  }
  //Hash Password
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPass });
  console.log(user);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//Desc-->Login a user
//EndPoint --> POST api/users/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All field are required");
  }
  const user = await User.findOne({ email });
  //compare password with hashedPassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: { username: user.username, email: user.email, id: user.id },
      },
      process.env.SECRET_KEY,

      {
        expiresIn: "15m",  
      }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Email or password is not valid");
  }
});

//Desc-->Current user info
//EndPoint --> Get api/users/register
const getUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getUser };
