const express = require('express');
const router = express();
const passport = require('passport'); 
const jwt = require("jsonwebtoken");
require("../passport");


// Auth 
router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
}))



router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `https://task-manager-app-one-neon.vercel.app/login` }), 
    (req, res) => {
        if (req.user) {
            const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.cookie('token', token, { httpOnly: false, secure: true, sameSite: 'none',  path: '/', domain:".taskmanagerapp-0lb7.onrender.com"});
            res.redirect(`https://task-manager-app-one-neon.vercel.app/dashboard`); // Use frontend URL here
        } else {
            res.redirect(`https://task-manager-app-one-neon.vercel.app/login`); // Use frontend URL here
        }
    }
);


module.exports = router;

