var express = require('express');
var router = express.Router();

const User = require('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const isAuthenticated = require('../middleware/isAuthenticated');

const { verify } = require('../controllers/auth');

router.post('/signup', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'please fill out all fields' });
  }

  User.findOne({ email: req.body.email })
    .then((foundUser) => {
      if (foundUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      } else {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPass = bcrypt.hashSync(req.body.password, salt);

        User.create({
          username: req.body.username,
          password: hashedPass,
          email: req.body.email,
          name: req.body.name,
        })
          .then((createdUser) => {
            const payload = {
              _id: createdUser._id,
              email: createdUser.email,
              image: createdUser.profile_image,
              username: createdUser.username,
            };

            const token = jwt.sign(payload, process.env.SECRET, {
              algorithm: 'HS256',
              expiresIn: '24hr',
            });
            res.json({ token: token, id: createdUser._id });
          })
          .catch((err) => {
            res.status(400).json(err.message);
          });
      }
    })
    .catch((err) => {
      res.status(400).json(err.message);
    });
});

router.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'please fill out both fields' });
  }

  User.findOne({ email: req.body.email })
    .then((foundUser) => {
      if (!foundUser) {
        return res
          .status(401)
          .json({ message: 'Email or Password is incorrect!' });
      }

      const doesMatch = bcrypt.compareSync(
        req.body.password,
        foundUser.password
      );

      if (doesMatch) {
        const payload = {
          _id: foundUser._id,
          email: foundUser.email,
          image: foundUser.profile_image,
          username: foundUser.username,
        };

        const token = jwt.sign(payload, process.env.SECRET, {
          algorithm: 'HS256',
          expiresIn: '24hr',
        });
        res.json({
          token: token,
          id: foundUser._id,
          image: foundUser.profile_image,
          message: `Welcome ${foundUser.email}`,
        });
      } else {
        return res
          .status(402)
          .json({ message: 'Email or Password is incorrect' });
      }
    })
    .catch((err) => {
      res.json(err.message);
    });
});

router.get('/verify', isAuthenticated, verify);

module.exports = router;
