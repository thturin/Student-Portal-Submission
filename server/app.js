const express = require('express');
const cors = require('cors');
const submissionRoutes = require('./routes/submissionRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const sectionRoutes = require('./routes/sectionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pythonRoutes = require('./routes/pythonRoutes');
const {PrismaClient} = require('@prisma/client');
require('dotenv').config(); //load environment variables from .env


const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}));

app.use(express.json());

console.log('--------------------BEGIN----------------------');

//REQUIRED FOR GITHUB Oauth
const session = require('express-session');//ceaet a session
const FileStore = require('session-file-store')(session);
const passport = require('passport');//create a passport
//passport attaches helper methods to the request object for every incoming request
// these middleware add methods to req are req.logout, req.login



app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true, //session refreshes after every request. 
  store: new FileStore({
        path: './sessions',
        ttl: 24 * 60 * 60, // 24 hours in seconds
        retries: 5
    }),
    name: 'studentPortalSession',
  cookie:{ //COOKIE SETTINGS.  
    //how to set session timeout
    maxAge: 60*60*1000,//1 hour (in milliseconds)
    sameSite:'lax', //or 'none' if using https,
    secure:false // true if using https
  }
}));

//middilewayre
app.use((req, res, next) => {
    if (req.session) {
        const now = new Date();
        const expires = new Date(req.session.cookie._expires);
        const timeLeft = expires - now;
        
        console.log('🕐 Session Debug:', {
            sessionID: req.sessionID,
            timeLeftMinutes: Math.round(timeLeft / (1000 * 60)),
            expires: expires.toLocaleTimeString(),
            isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A',
            user: req.user ? req.user.email : 'none'
        });
    }
    next();
});

app.use(passport.initialize());
app.use(passport.session());

require('./auth/github'); // Registers the strategy github

// ADD THIS DEBUG MIDDLEWARE:
app.use((req, res, next) => {
    console.log('🔍 Every Request Debug:', {
        method: req.method,
        url: req.url,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionData: req.session,
        hasCookies: !!req.headers.cookie,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A'
    });
    next();
});





app.use('/api/auth', authRoutes);
app.use('/api/', submissionRoutes); //call the router object in submissionRoutes (it is exported)
app.use('/api/assignments', assignmentRoutes); //call the router object in assignmentRoutes
app.use('/api/',userRoutes);//two different endpoints /users and /login
app.use('/api/sections',sectionRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/python',pythonRoutes);

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
});


app.get('/', (req, res)=>{
    res.send('Backend is running!');
    console.log(req);
});
