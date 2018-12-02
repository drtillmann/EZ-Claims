var express = require('express');
var router = express.Router();
var strings = require('../strings/strings');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(globalUserID != undefined){
    res.render('home', { title: strings.welcome});
  }else{
    //res.render('index', { title: 'Welcome to EZ-Claims' });
    res.redirect("/")
  }
  
});

module.exports = router;