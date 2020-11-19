var express=require('express');
var router=express.Router();
var User=require('../models/user');
var passport=require('passport');
var dotenv = require('dotenv');
dotenv.config();
// root
router.get('/',(req,res)=> res.render('landing'));

router.get("/landing",function(req,res){
    res.render("landing")
});

// Auth Routes

// Sign Up show register 
router.get("/register",function(req,res){
    res.render("register");
});

// SignUp logic
router.post("/register",function(req,res){

    var newUser=new User({username:req.body.username});
    
    // Check for Admin
    if(req.body.username === process.env.user && req.body.password === process.env.pass)
    {
        newUser.isAdmin = true;
    }

    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);  // we are just displaying the err (easy method given by passport)
            return res.redirect("/register"); //*************  Bugg   ********/
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to YelpCamp "+user.username);
            res.redirect("/campgrounds");
        });
    });
});
 
// Login form
router.get("/login",function(req,res){
    res.render("login");
});
// handles login form logic
router.post("/login",passport.authenticate("local",
   {
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
   }),function(req,res){
});

//logout
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out"); // success is just a key in flash can be anything
    res.redirect("/campgrounds");
}); 

module.exports=router;