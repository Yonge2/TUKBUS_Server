const {getMySQL, setMySQL} = require("../../db/conMysql");
const {sch_Csv2Json} = require("../../util/editcsv");

//insert data
const insertSchedule = async(req, res) => {
    const univName = req.body.univName;
    const day = req.body.day;

    const tableName = (day==="Weekday")?(univName==="TUK")?"TUK_Sch_Weekday" : "GTEC_Sch": "TUK_Sch_Saturday";

    const inserQuery = `INSERT INTO ${tableName} SET ?`;

    const newSchedule = await sch_Csv2Json(univName, day);

    const pormises = newSchedule.map(async(ele)=>{
        return setMySQL(inserQuery, ele).catch((e)=>{
            console.log("inserting schedule err: ",e);
        });
    })

    const insertingResult = await Promise.allSettled(pormises);
    if(insertingResult.length === newSchedule.length) res.status(200).json({success: true})
    else res.status(200).json({success: false})
}

const deleteSchedule = async(req, res) => {
    const univName = req.body.univName;
    const day = (req.body.day!=undefined)? req.body.day : null;

    const tableName = (day===null)?(univName==="TUK")?"TUK_Sch_Weekday" : "GTEC_Sch": "TUK_Sch_Saturday";

    const delQuery = `DELETE FROM ${tableName}`;

    const result = await getMySQL(delQuery).catch((e)=>{
        console.log("del mysql err: ", e);
    })
    console.log(result);
    if(result.affectedRows) res.status(200).json({success: true});
    else res.status(200).json({success:false});
}

module.exports = {insertSchedule, deleteSchedule}