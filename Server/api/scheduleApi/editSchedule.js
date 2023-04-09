const {getMySQL, setMySQL} = require("../../db/conMysql");
const {TUK_schWeekdayJson, GTEC_schJson} = require("../../util/editcsv");

//insert data
const insertSchedule = async(req, res) => {
    const univName = req.body.univName;
    const tableNmae = (univName==="TUK")?"Bus_Sch_Weekday" : "gtec_sch";

    const inserQuery = `INSERT INTO ${tableNmae} SET ?`;

    const newSchedule = (univName==="TUK")? await TUK_schWeekdayJson() : await GTEC_schJson();

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
    const delQuery = 'delete from Bus_Sch_Weekday';
    const result = await getMySQL(delQuery).catch((e)=>{
        console.log("del mysql err: ", e);
    })
    console.log(result);
    if(result.affectedRows) res.status(200).json({success: true});
    else res.status(200).json({success:false});
}

module.exports = {insertSchedule, deleteSchedule}