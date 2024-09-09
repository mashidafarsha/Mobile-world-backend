
const express = require('express');
const connectDB = require('./config/dbConnection')
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const path = require('path');
let env = require("dotenv").config(); 


// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());

const userRoute= require("./routes/userRouter")
const adminRoute=require("./routes/adminRouter")


connectDB();
app.use('/', express.static(path.join(__dirname, 'public')))    
app.use(bodyParser.json({limit:"1200kb"}))
const corsOptions = {
    origin:[process.env.CORS_API] , // allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // allowed methods
    credentials: true, // enable set cookie
    optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  
  app.use(cors(corsOptions));

  app.use('/', userRoute)
  app.use('/admin', adminRoute)



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
