const express = require('express');
const router = express.Router();
const {getChatlist, createChatRoom} = require('./chatInfoUtil');
const jwt_middleWare = require('../userApi/user_util/authMiddleware');

router.get('/getchatlist', jwt_middleWare, getChatlist);

router.post('/createchatroom', jwt_middleWare, createChatRoom);

module.exports = router;
