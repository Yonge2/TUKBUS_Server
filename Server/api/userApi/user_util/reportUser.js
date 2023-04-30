const {setMySQL, getMySQL} = require('../../../db/conMysql');
const dayjs = require('dayjs');
const {userQuery} = require('../../../private/query');

const reportUser = async(req, res)=>{
    const reportSet = reportObj(req);

    const result = await setMySQL(userQuery.report, reportSet).catch((e)=>{
        console.log('inserting "reported" err:', e);
        res.status(200).json({success: false, message: e});
    });

    if(result.affectedRows) res.status(200).json({success: true, message: "신고완료"});
    else res.status(200).json({success: false});
}

const blockUser = async(req, res)=>{
    const blockSet = blockObj(req);

    const result = await setMySQL(userQuery.block, blockSet).catch((e)=>{
        console.log("inserting blocked err: ",e);
        res.status(200).json({success: false, message: e});
    });

    if(result.affectedRows) res.status(200).json({success: true, message: "차단완료"});
    else res.status(200).json({success: false});
}


const blockedUserList = async(req, res)=>{
    const result = await getBlockedUserList(req.userID).catch((e)=>{
        res.status(200).json({success: false, message: e});
    });
    if(result.length===1){
        res.status(200).json({
            success: true,
            message: {
                blockUserList: [result]
            }
        });
    }
    else if(result.length>1){
        res.status(200).json({
            success: true,
            message: {
                blockUserList: result
            }
        });
    }
    else res.status(200).json({success: true, message: {blockUserList: []}});
}


const getBlockedUserList = async(userID)=>{
    return new Promise(async(resolve, reject)=>{
        const getBlockedQuery = userQuery.getBlock(userID);
        const result = await getMySQL(getBlockedQuery).catch((e)=>{
            console.log('getting "reported" err:', e);
            reject(e);
        })
        resolve(result);
    })
}

const delBlockedUser = async(req, res)=>{
    const delBlockedUserQuery = userQuery.delBlock(req.userID, req.body.blockedUserID);

    const result = await getMySQL(delBlockedUserQuery).catch((err)=>{
        console.log('delete blockedUser err ', err);
        res.status(200).json({success: false, message: 'db err'});
    });
    if(result.affectedRows) res.status(200).json({success: true});
    else res.status(200).json({success: false});
}


const submitOpnion = async(req, res)=>{
    const insertSet = {
        userID: req.userID,
        detail: req.body.detail,
        date: new dayjs().format('YYYY-MM-DD HH:mm')
    }

    const result = await setMySQL(userQuery.submit, insertSet).catch((err)=>{
        console.log('submitOpinion err: ', err);
        res.status(200).json({success: false});
    });
    if(result.affectedRows){
        res.status(200).json({success: true});
    }
    else res.status(200).json({success: false});
}



module.exports = {reportUser, blockUser, blockedUserList, submitOpnion, delBlockedUser};

const blockObj = (req) =>{
    return {
        userID: req.userID,
        blockedUserID: req.body.blockedUserID,
    }
}

const reportObj = (req) =>{
    return {
        userID: req.userID,
        reportedUserID: req.body.reportedUserID,
        reportedReason: req.body.reportedReason,
    }
}