const express = require("express");
const app = express();
const {dbConnect} = require("./config/database");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/User");
const todoRoutes = require("./routes/Todo");
const authRoutes = require("./routes/googleUser");
const cors = require("cors");
const session = require('express-session');
require("dotenv").config();



const PORT = process.env.PORT || 3000;

// Enforce HTTPS
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// CORS Configuration
app.use(
	cors({
		origin:"https://task-manager-app-one-neon.vercel.app",
		credentials:true,
	})
)

// Session Configuration
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET ,
    cookie: {
        secure: true,        
        httpOnly: false,    
        sameSite: 'None',     
        path:"/"
    }
}));


// Connect to Database
dbConnect();

// Middleware for parsing JSON requests and cookies
app.use(express.json());
app.use(cookieParser());

// Route Handlers
app.use("/api/v1", userRoutes);
app.use("/api/v1", todoRoutes);
app.use("/", authRoutes)

// Start the server
app.listen(PORT, ()=>{
    console.log(`Server Started Successfully at ${PORT}`);
});