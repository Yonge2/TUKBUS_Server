const express = require('express');
const router = express.Router();
const {getChatRoomList, createChatRoom} = require('./chatInfoUtil');
const {outChatroom, saveMessage, loadMessage} = require('./chatUtil');
const jwt_middleWare = require('../userApi/user_util/authMiddleware');

router.get('/getchatlist', jwt_middleWare, getChatRoomList);

router.post('/createchatroom', jwt_middleWare, createChatRoom);

router.post('/chatroom/out', jwt_middleWare, outChatroom);
router.post('/chatroom/message', jwt_middleWare, saveMessage);
router.post('/chatroom/loadMessage', jwt_middleWare, loadMessage);


module.exports = router;
