/*
creatae table reported(userID varchar(20) not null, reportedUserID varchar(20) not null, reportedReason varchar(50));
userID varchar
reportedUserID varchar
reportedReason varchar

<blocked>
userID varchar
blockedUserID varchar
*/

const {setMySQL, getMySQL} = require('../../../db/conMysql');
const dayjs = require('dayjs');

const reportUser = async(req, res)=>{
    const reportQuery = 'INSERT INTO reported SET ?'
    const reportSet = reportObj(req);
    const result = await setMySQL(reportQuery, reportSet).catch((e)=>{
        console.log('inserting "reported" err:', e);
        res.status(200).json({success: false, message: e});
    });
    if(result) res.status(200).json({success: true, message: "신고완료"});
}

const blockUser = async(req, res)=>{
    console.log("in");
    const blockQuery = 'INSERT INTO blocked SET ?'
    const blockSet = blockObj(req);
    const result = await setMySQL(blockQuery, blockSet).catch((e)=>{
        console.log("inserting blocked err: ",e);
        res.status(200).json({success: false, message: e});
    });
    console.log(result);
    if(result) res.status(200).json({success: true, message: "차단완료"});
}


const blockedUserList = async(req, res)=>{
    const result = await getBlockedUserList(req.userID).catch((e)=>{
        res.status(200).json({success: false, message: e});
    });
    if(result.length){
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
        const getBlockedQuery = `SELECT blockedUserID FROM blocked WHERE userID = "${userID}";`
        const result = await getMySQL(getBlockedQuery).catch((e)=>{
            console.log('getting "reported" err:', e);
            reject(e);
        })
        resolve(result);
    })
}


//요청 시간 추가, 테이블에 컬럼 추가 
const submitOpnion = async(req, res)=>{
    const date = new dayjs().format('YYYY-MM-DD HH:mm');
    const insertQuery = `INSERT INTO submitOpinion SET ?`
    const insertSet = {userID: req.userID, detail: req.body.detail, date: date};
    const result = await setMySQL(insertQuery, insertSet).catch((err)=>{
        console.log('submitOpinion err: ', err);
        res.status(200).json({success: false});
    });
    if(result.affectedRows){
        res.status(200).json({success: true});
    }
    else res.status(200).json({success: false});
}



module.exports = {reportUser, blockUser, blockedUserList, submitOpnion};

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