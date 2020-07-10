var express=require('express');
var router=express.Router();
var Campground=require('../models/campground');
var Comment=require('../models/comment');
var middleware=require('../middleware/index');
// middleware object contains all the function for the middlewares and accessed by middleware.functionName 

// Comments new
router.get('/campgrounds/:id/comments/new',middleware.isLoggedIn,function(req,res){ // Only logged in user can make comment
    Campground.findById(req.params.id,function(err,campground){
        if(err)console.log(err);
        else{
            res.render("comments/new",{campground:campground});
        }
    });
});

// Comments Create
router.post("/campgrounds/:id/comments",middleware.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                    req.flash("error","Something went wrong!!!");
                }
                else{
                    // add username and id to comment
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();
                    //console.log(comment.author);
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Successfully added comment");
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});

// Comment Edit
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err || !foundCampground){
            req.flash("error","No campground found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id,function(err,found_comment){
            if(err){
                res.redirect("back");
            }
            else{
                res.render("comments/edit",{campgroundId:req.params.id,comment:found_comment});
            }
        })
    });

});
// Comment Update
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,UpdatedComment){ // the second obj passed is obj
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// Comment Delete
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndDelete(req.params.comment_id,function(err,deleted){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","Comment deleted");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// // Middleware
// function checkCommentOwnership(req,res,next){
//     if(req.isAuthenticated()){
//         Comment.findById(req.params.comment_id,function(err,found_comment){
//             if(err){
//                res.redirect("back"); 
//             }
//             else{
//                   // does user own comment
//                   if(found_comment.author.id.equals(req.user._id)){
//                     next(); // Move to the next code
//                   }else{
//                     res.redirect("back");
//                   }
//             }
//         })
//     }else{
//         res.redirect("back");
//     }
// }

module.exports=router;