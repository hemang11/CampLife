var express=require('express');
var router=express.Router();
var Campground=require('../models/campground');
var middleware=require('../middleware/index');
// middleware object contains all the function for the middlewares and accessed by middleware.functionName 

// // Index - route
// router.get("/campgrounds",function(req,res){

//     // get all campgrounds from database
//     Campground.find({},function(err,allcampgrounds){ //allcampground is coming from databse is an array of objects
//         if(err)console.log(err);
//         else{
//             //console.log(allcampgrounds);
//             res.render("campground/index",{campgrounds:allcampgrounds}); // req.user gives the curently logged in user
//         }
//     });
// });

    // // INDEX - show all campgrounds with paginaton
    router.get("/campgrounds", function (req, res) {
        var perPage = 8;
        var pageQuery = parseInt(req.query.page); // page Query is the page number on which you are
         //console.log(pageQuery);
         var pageNumber = pageQuery ? pageQuery : 1; // if pageQuery is NaN for the home <page></page> then pageQuery is 1

        // Fuzzy-Search
        if(req.query.search)
        {
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds){
                Campground.countDocuments().exec(function (err, count) {
                    if(err){
                            console.log(err);
                        } 
                    else {
                        res.render("campground/index",{
                            campgrounds:allCampgrounds,
                            current:pageNumber,
                            pages: Math.ceil(count/perPage)
                            });
                        }
                });
             });

        }else{
            Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
                Campground.countDocuments().exec(function (err, count) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("campground/index", {
                            campgrounds: allCampgrounds,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage)
                        });
                    }
                });
            });
        }
    });

// New - route
router.get("/campgrounds/new",middleware.isLoggedIn,function(req,res){
    res.render("campground/new");
});

// Create - route
router.post("/campgrounds",middleware.isLoggedIn,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var desc=req.body.description;
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var price=req.body.price;
    var obj={name:name,image:image,description:desc,author:author,price:price}; // as array is made up of objects so we constructed a object
    // create a new campground and save to databse
    Campground.create(obj,function(err,camp){
        if(err)console.log(err);
        else{
            //console.log("Campground added");
            //console.log(camp);
        }
    })
    res.redirect("/campgrounds");
     
});

// Show - route shows more informaton about one campground
router.get("/campgrounds/:id",function(req,res){
    // find the campground with given id and render how template
    Campground.findById(req.params.id).populate("comments").exec(function(err,found_camp){ // populating the comment
        if(err || !found_camp){
            req.flash("error","Campground not found");
            res.redirect("back");
        }
        else{
        res.render("campground/show",{campground:found_camp}); //found_camp is an object
        }
    });
});

// Like Route
// Campground Like Route
router.post("/campgrounds/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

// Edit
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
        Campground.findById(req.params.id,function(err,found_campground){
                    res.render("campground/edit",{campground:found_campground});
        });
});

// Update
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
    // find and update and redirect
    Campground.findByIdAndUpdate(req.params.id,req.body.campground_obj,function(err,updated_camp){
        if(err)console.log("err");
        else{
            res.redirect('/campgrounds/'+req.params.id);
        }
    });
});

// delete
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err)console.log(err);
        else{
            req.flash("success","Post deleted");
            res.redirect("/campgrounds");
        }
    })
});

// // Middleware
// function isLoggedIn(req,res,next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login")
// }


// To do Fuzzy-Search we have to include this
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;