var express = require("express");
var router = express.Router();
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User");
const Tip = require("../models/Tip");
const Comment = require("../models/Comment");

router.get("/all-tips", (req, res) => {
  Tip.find()
    .sort({ createdAt: -1 })
    .populate("comments")
    .then((foundTips) => {
      res.json(foundTips);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/add-picture", fileUploader.single("picture"), (req, res) => {
  res.json(req.file.path);
});

router.post("/add-tip", (req, res) => {
  let newTip = {
    picture: req.body.picture,
    owner: req.body.owner,
    ownerpicture: req.body.ownerpicture,
    text: req.body.text,
    likes: [],
    comments: [],
    category: req.body.category,
    location: req.body.location,
    ownerId: req.body.ownerId,
  };

  Tip.create(newTip)
    .then((createdTip) => {
      User.findByIdAndUpdate(
        req.body.ownerId,
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
});

router.post("/add-picture", fileUploader.single("picture"), (req, res) => {
  res.json(req.file.path);
});

router.post("/add-comment", (req, res) => {
  let newComment = {
    owner: req.body.owner,
    ownerpicture: req.body.ownerpicture,
    text: req.body.text,
    likes: req.body.likes,
  };
  Comment.create(newComment)
    .then((newComment) => {
      Tip.findByIdAndUpdate(
        req.body.id,
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
});

router.post("/add-like", (req, res) => {
  const userId = req.body.userId;
  const tipId = req.body.tipId;

  Tip.findById(tipId)
    .then((tip) => {
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      if (tip.likes.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User has already liked this tip" });
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
          res.status(500).json({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/tip-detail/:id", (req, res) => {
  const id = req.params.id;
  Tip.findById(id)
    .populate("comments")
    .then((foundTip) => {
      res.json(foundTip);
    })
    .catch((err) => {
      console.log({ message: err });
    });
});

router.get("/comment/delete/:id", (req, res, next) => {
  const id = req.params.id;
  Comment.findByIdAndDelete(id)
    .then((deletedComment) => {
      res.json(deletedComment);
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).send("Error deleting comment");
    });
});

router.get("/tip/delete/:id", (req, res, next) => {
  const id = req.params.id;
  Tip.findByIdAndDelete(id)
    .then((deletedTip) => {
      res.json(deletedTip);
    })
    .catch((err) => {
      console.log({ message: err });
      res.status(500).send("Error deleting Tip");
    });
});

router.post("/tip-detail/:id", async (req, res, next) => {
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
    console.log({message: err});
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
