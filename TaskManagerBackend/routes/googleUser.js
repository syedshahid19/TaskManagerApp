const express = require('express');
const router = express.Router();  // Use `express.Router()` instead of `express()`
const passport = require('passport'); 
const jwt = require("jsonwebtoken");
require("../passport");  // Ensure passport config is imported

// Initiate Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));


router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        // Redirect to login page with an error message if authentication fails
        return res.redirect(`https://task-manager-app-one-neon.vercel.app?error=${encodeURIComponent('Google login failed. Please log in using form credentials.')}`);
      }
  
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
  
        // If login successful, create JWT and redirect to dashboard
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: false, secure: true, sameSite: 'None' });
        res.redirect('https://task-manager-app-one-neon.vercel.app/dashboard');
      });
    })(req, res, next);
  });
  
module.exports = router;
