const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
var strings = require('../strings/strings');
var bUserMatch = false;

router.post('/login', (req, res, next)=>{
    console.log("Enterd /login");
    console.log(req.body.email)
    console.log(req.body.password);
    User.find({email: req.body.email})
    .exec()
    .then(user =>{
        if(user.length == 1){
            console.log("User info: " + user);
            console.log(user[0]._id);
            console.log(user[0].email);
            console.log(user[0].name);



            /* IMPLEMENT LOGIN VALIDATION HERE */


            bcrypt.compare(req.body.password, user[0].password, function(err, result){
                console.log(result.valueOf());
                if(result == true){
                    globalUserID = user[0]._id;
                    global.globalName = user[0].name;
                    res.redirect('/home');
                }else{
                    res.render('message', {title: "Incorrect Password", message: "The password you provided does not match."});
                    
                }
            })



/*
            bcrypt.hash(req.body.password,10,(err, hash)=>{
                if(err){
                    return res.status(500).json({
                         error: err
                    });
                }else{
                    console.log(hash);
                    console.log(user[0].password);
                    bcrypt.compare(hash, user.password, function(err, result){
                        console.log(result.valueOf());
                        if(result == true){
                            //res.render('home', {title: "Home", userInfo: user});
                            res.redirect('/home?'+user[0]._id);
                        }else{
                            //res.render('home', {title: "Home", userInfo: user});
                            res.redirect('/home?userID='+user[0]._id);
                        }
                    })
                    }
                })*/
        }else{
            //res.render('message', {title: "Message", message: "No user found with that email"});
            res.redirect('/');
        }
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
})

router.get('/logout', function(req, res, next) {
    globalUserID = undefined;
    res.render('index', { title: strings.welcome });
  });

router.delete('/:userId', (req, res, next)=>{
    User.remove({_id: req.body.userId})
    .exec()
    .then(result =>{
        res.status(200).json({
            message: "User Deleted Successfully!"
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            err: err
        });
    });
});


router.get('/:userId',(req, res, next)=>{
    const id = req.params.userId;
    User.findById(id)
    .exec()
    .then(doc => {
        console.log("doc info from the DB", doc);
        if(doc){
            res.status(200).json({
                email: doc.email
            });
        }else{
            res.status(404).json({
                message: "No user found with that userID"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});


















module.exports = router;