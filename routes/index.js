var express = require('express');
var router = express.Router();
var strings = require('../strings/strings');

/* GET home page. */
router.get('/', function(req, res, next) {
  global.globalUserID = undefined;
  res.render('index', { title: strings.welcome });
});

module.exports = router;
