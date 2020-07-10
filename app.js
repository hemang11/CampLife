var express=require("express");
var app=express();
var path=require('path');
var bodyParser=require("body-parser");
var mongoose=require('mongoose');
var methodOverride=require('method-override');
var seedDb=require('./models/seed');
var flash=require('connect-flash');

// Connect to DB Atlas
mongoose.connect('mongodb+srv://Hemang:Hemang%40123@camplife.ogzpk.mongodb.net/camplife?retryWrites=true&w=majority',{useNewUrlParser: true});
//const client = MongoClient('mongodb+srv://Hemang:Hemang%40123@camplife.ogzpk.mongodb.net/camplife?retryWrites=true&w=majority', { useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
//mongoose.connect("mongodb://localhost/yelp_camp",{ useNewUrlParser: true, useUnifiedTopology: true}); // connect to mongodb locally
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname+'/public'));
app.set("view engine","ejs");
app.use(flash());

// Passport require
var passport=require('passport');
var LocalStrategy=require('passport-local');
//passportLocalMongoose in user model
var User=require('./models/user');

// ##### Passport config
app.use(require('express-session')({
    secret:"I won't loose",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// seedDB used for adding and removing campground
//seedDb(); //Was used just for testing purposes...

//Schema setup requiring from model dir
var Comment=require('./models/comment');
var Campground=require('./models/campground.js');

//Global declarations...(can be used from anywhere in the code)
app.use(function(req,res,next){
    res.locals.currentUser=req.user; //value of currentUser s now global and is set to req.user and is available on every route
    res.locals.error=req.flash("error"); // message has now become global and can be used anywhere in the code
    res.locals.success=req.flash("success"); // success and error are keys in flash can be anything
    next(); // important in middleware
});

// Router require and use
var commentRoutes=require('./routes/comments');
var campgroundRoutes=require('./routes/campgrounds');
var indexRoutes=require('./routes/index');
app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);

// Server Side.........
var PORT=process.env.PORT || 5000;
app.listen(PORT,process.env.IP,function(){  // can run on any port
	console.log("Our CampLife server has started");
});