var express = require('express');
const User = require('../models/User');
const Tip = require('../models/Tip');
const Comment = require('../models/Comment');

const allTips = (req, res) => {
  Tip.find()
    .sort({ createdAt: -1 })
    .populate('comments')
    .then((foundTips) => {
      res.json(foundTips);
    })
    .catch((err) => {
      console.log(err);
    });
};

const addTip = (req, res) => {
  const { picture, owner, ownerpicture, text, category, location, ownerId } =
    req.body;

  let newTip = {
    picture,
    owner,
    ownerpicture,
    text,
    likes: [],
    comments: [],
    category,
    location,
    ownerId,
  };

  Tip.create(newTip)
    .then((createdTip) => {
      User.findByIdAndUpdate(
        ownerId,
        {
          $push: { tips: createdTip._id },
        },
        { new: true }
      )
        .then((updatedUser) => {
          res.json(updatedUser);
        })
        .catch((err) => {
          console.log({ message: err });
        });
    })
    .catch((err) => {
      console.log({ message: err });
    });
};

const addPicture = (req, res) => {
  res.json(req.file.path);
};

const addComment = (req, res) => {
  const { owner, ownerpicture, text, likes, id } = req.body;

  let newComment = {
    owner,
    ownerpicture,
    text,
    likes,
  };

  Comment.create(newComment)
    .then((newComment) => {
      Tip.findByIdAndUpdate(
        id,
        {
          $push: { comments: newComment._id },
        },
        { new: true }
      )
        .then((updatedTip) => {
          res.json(updatedTip);
        })
        .catch((err) => {
          console.log({ message: err });
        });
    })
    .catch((err) => {
      console.log({ message: err });
    });
};

module.exports = { allTips, addTip, addPicture, addComment };
