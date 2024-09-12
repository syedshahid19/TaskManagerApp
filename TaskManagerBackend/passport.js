const passport = require('passport'); 
const User = require("./models/User");
const GoogleStrategy = require('passport-google-oauth2').Strategy; 


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://taskmanagerapp-0lb7.onrender.com/auth/google/callback",
  passReqToCallback: true,
}, 
async (request, accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  
  let user = await User.findOne({ email });
  
  // Check if the user exists with form-based signup
  if (user && user.authProvider === 'form') {
    return done(null, false, { message: 'Please log in using form credentials.' });
  }

  // If user doesn't exist, create a new Google user
  if (!user) {
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      authProvider: 'google',
    });
    await user.save();
  }

  done(null, user);
}));

passport.serializeUser((user , done) => { 
	done(null , user.id); 
}) 
passport.deserializeUser(async(id, done) =>{ 
	const user1 = await googleUser.findById(id);
  done(null, user1);
}); 

