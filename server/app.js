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

app.use((req,res,next)=>{
  console.log('CORS DEBUG:',{
    CLIENT_URL: process.env.CLIENT_URL,
    origin: req.headers.origin,
    method:req.method,
    url:req.url
  });
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, //session refreshes after every request. 
  store: new FileStore({ //store the session
        path: './sessions',
        ttl: 24 * 60 * 60, // 24 hours in seconds
        retries: 5
    }),
    name: 'studentPortalSession',
  cookie:{ //COOKIE SETTINGS.  
    //how to set session timeout
    maxAge: 60*60*1000,//1 hour (in milliseconds)
    sameSite:'lax', //or 'none' if using https,
    secure:process.env.NODE_ENV === 'production',// true if using https
    httpOnly: true //for security purposes
  }
}));

//middleware for debugging session
// app.use((req, res, next) => {
//     if (req.session) {
//         const now = new Date();
//         const expires = new Date(req.session.cookie._expires);
//         const timeLeft = expires - now;
        
//         console.log('🕐 Session Debug:', {
//             sessionID: req.sessionID,
//             timeLeftMinutes: Math.round(timeLeft / (1000 * 60)),
//             expires: expires.toLocaleTimeString(),
//             isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A',
//             user: req.user ? req.user.email : 'none'
//         });
//     }
//     next();
// });

app.use(passport.initialize());
app.use(passport.session());

require('./auth/github'); // Registers the strategy github

// ADD THIS DEBUG MIDDLEWARE:
// app.use((req, res, next) => {
//     console.log('🔍 Every Request Debug:', {
//         method: req.method,
//         url: req.url,
//         sessionID: req.sessionID,
//         hasSession: !!req.session,
//         sessionData: req.session,
//         hasCookies: !!req.headers.cookie,
//         isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A'
//     });
//     next();
// });


app.get('/', (req, res)=>{
    res.send('Backend is running!');
    console.log(req);
});

//add route for railway health checks
app.get('/health', (req,res)=>{
  res.json({
    status:'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/', submissionRoutes); //call the router object in submissionRoutes (it is exported)
app.use('/api/assignments', assignmentRoutes); //call the router object in assignmentRoutes
app.use('/api/',userRoutes);//two different endpoints /users and /login
app.use('/api/sections',sectionRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/python',pythonRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


