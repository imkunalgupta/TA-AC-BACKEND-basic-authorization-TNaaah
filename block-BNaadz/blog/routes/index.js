var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');
/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.register);
  res.render('index');
});

router.get('/protected', auth.loggedInRegister, (req, res) => {
  res.send('Protected resources');
});

module.exports = router;
