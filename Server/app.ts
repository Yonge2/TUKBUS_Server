import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { PORT } from './private/privatekey';


const app = express();

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


app.listen(port.PORT.appPort, '0.0.0.0', ()=> {
    console.log("Express server has started")
})