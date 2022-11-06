const express = require('express');
const app = express();

const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api/getSchedule', require('./api/getSchedule'));
app.use('/api/manage', require('./api/editSchedule'));
app.use('/api/user', require('./api/user/userRouter'));


const port = process.env.PORT || 3000;
const server = app.listen(port, function(){
    console.log("Express server has started")
})