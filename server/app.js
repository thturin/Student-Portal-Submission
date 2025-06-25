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
app.use(cors());
app.use(express.json());


//REQUIRED FOR GITHUB Oauth
const session = require('express-session');
const passport = require('passport');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

require('./auth/github'); //run github.js
app.use('/api/auth', authRoutes);


app.use('/api/', submissionRoutes); //call the router object in submissionRoutes (it is exported)
app.use('/api/assignments', assignmentRoutes); //call the router object in assignmentRoutes
app.use('/api/',userRoutes);//two different endpoints /users and /login


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
});




// app.get('/', (req, res)=>{
//     res.send('Hello world from express!');
//     console.log(req);
// });
