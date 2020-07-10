var Campground=require('../models/campground');
var Comment=require('../models/comment');
// all the middleware
var middlewareObj={};
// we are adding all the middleware functions inside an object and exporting it
middlewareObj.checkCampgroundOwnership=function(req,res,next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id,function(err,found_campground){
                if(err || !found_campground){
                  req.flash("error","Campground not found");
                   res.redirect("back"); 
                }
                else{
                      // does user own campground
                      //**wrong**if(found_campground.author.id===req.user._id)  // req.user.id is a string whereas found_campground_author.id is obj
                      if(found_campground.author.id.equals(req.user._id)){
                        next(); // Move to the next code
                      }else{
                        req.flash("error","You don't have permission to do that");
                        res.redirect("back");
                      }
                }
            })
        }else{
            req.flash("error","You need to be logged in to do that"); // error is just a key in flash can be anything
            res.redirect("back");
        }
}

middlewareObj.checkCommentOwnership=function(req,res,next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id,function(err,found_comment){
                if(err || !found_comment){
                   req.flash("error","Comment not found");
                   res.redirect("back"); 
                }
                else{
                      // does user own comment
                      if(found_comment.author.id.equals(req.user._id)){
                        next(); // Move to the next code
                      }else{
                        req.flash("error","You don't have permission to do that");
                        res.redirect("back");
                      }
                }
            })
        }else{
            req.flash("error","You need to be logged in to do that");
            res.redirect("back");
        }
}

middlewareObj.isLoggedIn=function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error","You need to be logged in to that");
        res.redirect("/login")
    }

// exporting the middleware object that contains all the middlware functions..
module.exports=middlewareObj;