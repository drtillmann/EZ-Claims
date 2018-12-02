var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var strings = require('../strings/strings');
const User = require('../models/userModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('registration', { title: strings.registration });
  console.log("enterd '/' route");
});




router.post('/signup', (req, res, next)=>{
  console.log("entered /signup route");
  User.find({email: req.body.email})
  .exec()
  .then(user =>{
      if(user.length >= 1){
          res.render('message', {title: "Message", message: "Email already exists!"});
      }else{
          bcrypt.hash(req.body.password,10,(err, hash)=>{
              if(err){
                  return res.status(500).json({
                       error: err
                  });
              }else{
                  console.log("Create User Object");
                  console.log(req.body.email);
                  console.log(hash);
                  console.log(req.body.name);
                  const user = new User({
                      _id: new mongoose.Types.ObjectId(),
                      email: req.body.email,
                      password: hash,
                      name: req.body.name
                  });

                      user
                      .save()
                      .then(result =>{
                          //console.log(result);
                          
                          res.render('success-message', {title: "Message", message: "User Created Successfully!"});
                      })
                      .catch(err => {
                          console.log(err);
                          res.status(500).json({
                              error: err
                          });
                      });
              
                  }
              })
          }
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({
              error: err
          });
      });
})




module.exports = router;