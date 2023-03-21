var express = require('express');
var router = express.Router();
const fileUploader = require('../config/cloudinary.config');
const User = require('../models/User');
const Tip = require('../models/Tip');
const Comment = require('../models/Comment');
const {
  allTips,
  addTip,
  addPicture,
  addComment,
} = require('../controllers/tips');

router.get('/all-tips', allTips);

router.post('/add-picture', fileUploader.single('picture'), addPicture);

router.post('/add-tip', addTip);

router.post('/add-comment', addComment);

router.post('/add-like', (req, res) => {
  const userId = req.body.userId;
  const tipId = req.body.tipId;

  Tip.findById(tipId)
    .then((tip) => {
      if (!tip) {
        return res.status(404).json({ message: 'Tip not found' });
      }
      if (tip.likes.includes(userId)) {
        return res
          .status(400)
          .json({ message: 'User has already liked this tip' });
      }

      Tip.findByIdAndUpdate(
        tipId,
        {
          $addToSet: { likes: userId },
        },
        { new: true }
      )
        .then((updatedTip) => {
          res.json(updatedTip);
        })
        .catch((err) => {
          console.log({ message: err });
          res.status(500).json({ message: 'Internal server error' });
        });
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.get('/tip-detail/:id', (req, res) => {
  const id = req.params.id;
  Tip.findById(id)
    .populate('comments')
    .then((foundTip) => {
      res.json(foundTip);
    })
    .catch((err) => {
      console.log({ message: err });
    });
});

router.get('/comment/delete/:id', (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndDelete(id)
    .then((deletedComment) => {
      res.json(deletedComment);
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).send('Error deleting comment');
    });
});

router.get('/tip/delete/:id', (req, res, next) => {
  const id = req.params.id;
  Tip.findByIdAndDelete(id)
    .then((deletedTip) => {
      res.json(deletedTip);
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).send('Error deleting Tip');
    });
});

router.post('/tip-detail/:id', async (req, res, next) => {
  const id = req.params.id;
  const { text, category, picture, location } = req.body;
  try {
    const updatedTip = await Tip.findByIdAndUpdate(
      id,
      { text, category, picture, location },
      { new: true }
    );
    res.json(updatedTip);
  } catch (err) {
    console.log({ message: err });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
