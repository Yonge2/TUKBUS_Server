const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const port = require('./private/privatekey_Tuk').PORT.appPort;

app.use(express.static(path.join(__dirname, 'intro/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/api/getSchedule', require('./api/scheduleApi/scheduleRouter'));
//app.use('/api/manage', require('./api/editSchedule'));
app.use('/api/user', require('./api/userApi/userRouter'));
app.use('/api/chatting', require('./api/chatApi/chatRouter'));

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/intro/build/index.html')
});


const server = app.listen(port, '0.0.0.0', ()=> {
    console.log("Express server has started")
})