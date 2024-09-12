const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;  // Password required only for form users
        },
    },
    googleId: {
        type: String,
        required: function() {
            return !this.password;  // Google ID required only for Google users
        },
    },
    authProvider: {
        type: String,
        required: true,
        enum: ['google', 'form'], // Tracks if the user signed up via Google or form
    }
},
{timestamps:true})

module.exports = mongoose.model("User", userSchema);