var Register = require('../models/register');
module.exports = {
  loggedInRegister: (req, res, next) => {
    if (req.session && req.session.registerId) {
      next();
    } else {
      res.redirect('/register/login');
    }
  },
  registerInfo: (req, res, next) => {
    var registerId = req.session && req.session.registerId;
    if (registerId) {
      Register.findById(
        registerId,
        'firstName lastName email',
        (err, register) => {
          if (err) return next(err);
          req.register = register;
          res.locals.register = register;
          next();
        }
      );
    } else {
      req.register = null;
      res.locals.register = null;
      next();
    }
  },
};
