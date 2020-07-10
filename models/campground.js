var mongoose=require('mongoose');

var campgroundSchema=new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ]
});
var Campground=mongoose.model("Campground",campgroundSchema); // This will create a campgrounds collectionn in db
module.exports=Campground;