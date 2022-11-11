const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
const uploadPath = path.join(__dirname, '../public/uploads');
const Podcast = require('../models/Podcast');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.use(auth.loggedInUser);

router.get('/', (req, res, next) => {
  if (req.user.isAdmin) {
    Podcast.find({ isApproved: true })
      .populate('createdBy', 'name')
      .exec((err, podcasts) => {
        if (err) return next(err);
        res.render('listPodcasts', { podcasts });
      });
  } else {
    Podcast.find({
      $and: [{ isApproved: true }, { podcastType: req.user.userType }],
    })
      .populate('createdBy', 'name')
      .exec((err, podcasts) => {
        if (err) return next(err);
        res.render('listPodcasts', { podcasts });
      });
  }
});

router.get('/new', (req, res, next) => {
  return res.render('podcastForm');
});

router.post('/new', upload.single('audio'), (req, res, next) => {
  req.body.audio = req.file.filename;
  req.body.createdBy = req.user.id;
  if (req.user.isAdmin) req.body.isApproved = true;
  Podcast.create(req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect('/podcasts');
  });
});

router.get('/user/:id', (req, res, next) => {
  let id = req.params.id;
  Podcast.find({ createdBy: id })
    .populate('createdBy', 'name')
    .exec((err, podcasts) => {
      if (err) return next(err);
      res.render('userPodcasts', { podcasts });
    });
});

router.use(auth.isAdmin);

router.get('/approve', (req, res, next) => {
  Podcast.find({ isApproved: false })
    .populate('createdBy', 'name')
    .exec((err, podcasts) => {
      if (err) return next(err);
      res.render('listPodcasts', { podcasts });
    });
});

router.get('/:id/approve', (req, res, next) => {
  let id = req.params.id;
  Podcast.findByIdAndUpdate(
    id,
    { $set: { isApproved: true } },
    (err, podcast) => {
      if (err) return next(err);

      res.redirect('/podcasts/approve');
    }
  );
});

router.get('/:id/edit', (req, res, next) => {
  let id = req.params.id;
  Podcast.findById(id)
    .populate('createdBy', 'name')
    .exec((err, podcast) => {
      if (err) return next(err);
      res.render('editPodcast', { podcast });
    });
});

router.post('/:id', (req, res, next) => {
  let id = req.params.id;
  Podcast.findByIdAndUpdate(id, req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect('/podcasts');
  });
});

router.get('/:id/delete', (req, res, next) => {
  let id = req.params.id;
  Podcast.findByIdAndDelete(id, (err, deletedPodcast) => {
    if (err) return next(err);
    let podcastPath = path.join(uploadPath, deletedPodcast.audio);
    console.log(podcastPath);
    fs.unlink(podcastPath, (err) => {
      if (err) return next(err);
      else res.redirect('/podcasts');
    });
  });
});

module.exports = router;
