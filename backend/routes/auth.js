const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');

const JWT_SECRET = "Vi$hw@si$@goodboy";


// Create a user using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must be atleast 5 letters').isLength({ min: 5 }),
  body('name', 'name must be atleast 3 letters').isLength({ min: 3 })

], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "Sorry a User with this Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
    })

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authtoken});
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// Authenticate a user using: POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be black').exists()
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  const {email, password} = req.body;
  try{
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({success, error: "Please Enter Correct Credentials"});
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      return res.status(400).json({error: "Please Enter Correct Credentials"});
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authtoken});
  } catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// Get LoggedIn user's details using: POST "/api/auth/getuser". Login required.
router.post('/getuser',fetchuser, async (req, res) => {
try{
  userId = req.user.id;
  const user = await User.findById(userId).select("-password");
  res.send(user);
}catch{
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}
})

module.exports = router;