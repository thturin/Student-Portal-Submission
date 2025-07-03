const express = require('express');
const cors = require('cors');
const submissionRoutes = require('./routes/submissionRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const {PrismaClient} = require('@prisma/client');
require('dotenv').config(); //load environment variables from .env


const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}));

app.use(express.json());


//REQUIRED FOR GITHUB Oauth
const session = require('express-session');//ceaet a session
const passport = require('passport');//create a passport
//passport attaches helper methods to the request object for every incoming request
// these middleware add methods to req are req.logout, req.login

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie:{ //COOKIE SETTINGS.  
    //how to set session timeout
    maxAge: 60*60*1000,//1 hour (in milliseconds)
    sameSite:'lax', //or 'none' if using https,
    secure:false // true if using https
  }
}));

app.use(passport.initialize());
app.use(passport.session());



require('./auth/github'); // Registers the strategy github
app.use('/api/auth', authRoutes);

app.use('/api/', submissionRoutes); //call the router object in submissionRoutes (it is exported)
app.use('/api/assignments', assignmentRoutes); //call the router object in assignmentRoutes
app.use('/api/',userRoutes);//two different endpoints /users and /login


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
});


app.get('/', (req, res)=>{
    res.send('Backend is running!');
    console.log(req);
});
