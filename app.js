
const express = require('express');
const connectDB = require('./config/dbConnection')
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const path = require('path');
let env = require("dotenv").config(); 



app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

const userRoute= require("./routes/userRouter")
const adminRoute=require("./routes/adminRouter")


connectDB();
app.use('/', express.static(path.join(__dirname, 'public')))    
app.use(bodyParser.json({limit:"1200kb"}))
const corsOptions = {
    origin:[process.env.CORS_API] , 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
    optionsSuccessStatus: 204 
  };
  
  app.use(cors(corsOptions));

  app.use('/', userRoute)
  app.use('/admin', adminRoute)



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
