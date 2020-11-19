var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');
var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    isAdmin : {type:Boolean,default:false} // Checks Whether User is Admin or not
});
userSchema.plugin(passportLocalMongoose);
var User=mongoose.model("User",userSchema);
module.exports=User;