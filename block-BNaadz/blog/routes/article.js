var express = require('express');
var router = express.Router();
var Register = require('../models/register');
var Article = require('../models/article');
var Comment = require('../models/comment');

var auth = require('../middlewares/auth');

/* GET home page. */
router.get('/', function (req, res, next) {
  Article.find({}, (err, articles) => {
    if (err) return next(err);
    res.render('articleList.ejs', { articles });
  });
});

router.get('/new', auth.loggedInRegister, function (req, res, next) {
  res.render('addArticles');
});

//fetch only one article

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  // Article.findById(id)
  //   .populate('comments')
  //   .exec((err, article) => {
  //     if (err) return next(err);
  //     res.render('singleArticle', { article });
  //   });
  Article.findById(id)
    .populate('comments')
    .populate('author', 'firstName lastName email')
    .exec((err, article) => {
      console.log(err, article);
      if (err) return next(err);
      res.render('singleArticle', { article });
    });
});

//protected rout
router.use(auth.loggedInRegister);

//Saving data
router.post('/', (req, res, next) => {
  //req.body.tags = req.body.tags.trim().split(' ');
  req.body.author = req.register.id;
  Article.create(req.body, (err, createdarticle) => {
    if (err) return next(err);
    res.redirect('/articles');
  });
});

router.get('/myArticle', function (req, res, next) {
  var id = req.params.id;
  Article.findByIdAndUpdate(id, (err, articles) => {
    if (err) return next(err);
    res.render('articleList.ejs', { articles });
  });
});

//updating article form
router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Article.findById(id, (err, article) => {
    if (err) return next(err);
    res.render('editArticle', { article });
  });
});

//update article
router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Article.findByIdAndUpdate(id, req.body, (err, updatedarticle) => {
    if (err) return next(err);
    res.redirect('/articles/' + id);
  });
});

//delete article
router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  if (req.register.id === id) {
    Article.findByIdAndDelete(id, (err, article) => {
      if (err) return next(err);
      Comment.deleteMany({ articleId: article.id }, (err, info) => {
        if (err) return next(err);
        res.redirect('/articles');
      });
    });
  } else {
    res.redirect('/articles');
  }
});

//adding comments
router.post('/:id/comments', (req, res, next) => {
  var id = req.params.id;
  req.body.articleId = id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment._id } },
      (err, updatedarticle) => {
        if (err) return next(err);
        res.redirect('/articles/' + id);
      }
    );
  });
});

//likes
router.get('/:id/inc', (req, res, next) => {
  var id = req.params.id;
  Article.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect('/articles/' + id);
  });
});

module.exports = router;
