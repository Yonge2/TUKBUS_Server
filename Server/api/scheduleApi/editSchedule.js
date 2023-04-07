const {getMySQL, setMySQL} = require("../../db/conMysql");
const {schWeekdayJson} = require("../../util/editcsv");

//insert data
const insertSchedule = async(req, res) => {
    const inserQuery = 'INSERT INTO Bus_Sch_Weekday SET ?';
    const newSchedule = await schWeekdayJson();

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