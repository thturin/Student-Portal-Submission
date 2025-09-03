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


//you are already using an authentication method so you ca * origin accept any 
app.use(cors({
  origin: process.env.CLIENT_URL, //there was no origin header
  credentials:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

console.log('--------------------BEGIN----------------------');

//REQUIRED FOR GITHUB Oauth
const session = require('express-session');//ceaet a session
//const FileStore = require('session-file-store')(session);

//DEACTIVATED
//const passport = require('passport');//create a passport
//passport attaches helper methods to the request object for every incoming request
// these middleware add methods to req are req.logout, req.login


//CREATE A SESSION FOR USER COOKIES 
//Railway uses a reverse proxy/load balancer
// Internet → Railway Load Balancer (HTTPS) → Your App (HTTP)
//            ↑ Sets X-Forwarded-Proto: https
//vs local environment (doesn't require proxy headers)
//Browser ←→ Direct Connection ←→ Your Express App (localhost:5000)


app.set('trust proxy',1); // trust 

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'studentPortalSession',
    cookie: {
        maxAge: 60*60*1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none': 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        domain: undefined
  }
};

if(process.env.NODE_ENV!=='production'){
    const FileStore = require('session-file-store')(session);
    sessionOptions.store = new FileStore({
        path: './sessions',
        ttl: 24 * 60 * 60,
        retries: 5
    });
}

//app.use required middleware function session()
app.use(session(sessionOptions));

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   rolling: true, //session refreshes after every request. 
//   store: new FileStore({ //store the session
//         path: './sessions',
//         ttl: 24 * 60 * 60, // 24 hours in seconds
//         retries: 5
//     }),
//     name: 'studentPortalSession',
//   cookie:{ //COOKIE SETTINGS.  
//     //how to set session timeout
//     maxAge: 60*60*1000,//1 hour (in milliseconds)
//     sameSite:process.env.NODE_ENV === 'production' ? 'none': 'lax', //or 'none' if using https,
//     secure:process.env.NODE_ENV === 'production',// true if using https
//     httpOnly: true, //for security purposes
//     domain:undefined
//   }
// }));


// app.use((req, res, next) => {
//     // Only log for auth-related routes to avoid spam
//     if (req.url.includes('/auth/') || req.url.includes('/me')|| req.url.includes('/callback')) {
//         console.log('🔧 COMPREHENSIVE DEBUG:');
//         console.log('-------- ENVIRONMENT VARIABLES --------');
//         console.log('NODE_ENV:', process.env.NODE_ENV);
//         console.log('CLIENT_URL:', process.env.CLIENT_URL);
//         console.log('SERVER_URL:', process.env.SERVER_URL);
//         console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? 'SET' : 'MISSING');
//         console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
//         console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING');
        
//         console.log('-------- REQUEST INFO --------');
//         console.log('Method:', req.method);
//         console.log('URL:', req.url);
//         console.log('Origin Header:', req.headers.origin || 'NO_ORIGIN');
//         console.log('Host Header:', req.headers.host);
//         console.log('Cookie Header:', req.headers.cookie || 'NO_COOKIES');
//         console.log('User-Agent:', req.headers['user-agent']?.substring(0, 50));
        
//         console.log('-------- SESSION INFO --------');
//         console.log('Session ID:', req.sessionID);
//         console.log('Session exists:', !!req.session);
//         if (req.session) {
//             console.log('Session data:', JSON.stringify(req.session, null, 2));
//             console.log('Session cookie settings:', req.session.cookie);
//             console.log('Passport session:', req.session.passport);
//         }
        
//         console.log('-------- AUTHENTICATION INFO --------');
//         console.log('isAuthenticated method exists:', typeof req.isAuthenticated);
//         console.log('isAuthenticated():', req.isAuthenticated ? req.isAuthenticated() : 'N/A');
//         console.log('req.user:', req.user ? JSON.stringify(req.user, null, 2) : 'undefined');
        
//         console.log('-------- COOKIE SETTINGS --------');
//         if (req.session && req.session.cookie) {
//             console.log('Cookie maxAge:', req.session.cookie.maxAge);
//             console.log('Cookie sameSite:', req.session.cookie.sameSite);
//             console.log('Cookie secure:', req.session.cookie.secure);
//             console.log('Cookie httpOnly:', req.session.cookie.httpOnly);
//             console.log('Cookie domain:', req.session.cookie.domain);
//             console.log('Cookie expires:', req.session.cookie._expires);
//         }
        
//         console.log('=====================================');
//     }
//     next();
// });

//DEACTIVATED
//app.use(passport.initialize());

//DEACTIVATED
//app.use(passport.session());

//DEACTIVATEDD
//require('./auth/github'); // Registers the strategy github


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



// Add this route to see environment variables via HTTP
app.get('/health-debug', (req, res) => {
    try {
        res.json({
            status: 'Railway Backend Running',
            environment: {
                CLIENT_URL: process.env.CLIENT_URL,
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'MISSING',
                DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
                FLASK_ENV: process.env.FLASK_ENV,
                FLASK_API_URL : process.env.FLASK_API_URL

            },
            request: {
                origin: req.headers.origin,
                host: req.headers.host,
                userAgent: req.headers['user-agent']
            },
            cors: {
                expectedOrigin: process.env.CLIENT_URL,
                actualOrigin: req.headers.origin || 'NULL',
                matches: req.headers.origin === process.env.CLIENT_URL
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
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
    console.log('CLIENT_URL:', JSON.stringify(process.env.CLIENT_URL));
});


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
