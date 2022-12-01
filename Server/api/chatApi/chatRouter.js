const express = require('express');
const router = express.Router();
const {getChatlist, createChatRoom} = require('./chatInfoApi');
const jwt_middleWare = require('../user/user_util/authMiddleware');

router.get('/getchatlist', jwt_middleWare, getChatlist);

router.post('/createchatroom', jwt_middleWare, createChatRoom);

module.exports = router;
