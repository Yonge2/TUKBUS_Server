const { csv } = require('../util/util.mod')
const mysql = require('../database/connection')
const { setSchedule, deleteSchedule } = require('./schedule.data/schedule.get.data')

//insert data
const setScheduleService = async(req, res) => {
    const univName = req.body.univName

    const csvSchedule = csv.checkFile()
    if(!csvSchedule){
        return res.status(400).json({message: '잘못된 요청, csv 파일 없음'})
    }
    const objectSchedules = await csv.scheduleFromCSV(univName, csvSchedule)

    const connection = await mysql.getConnection()
    await connection.beginTransaction()
    try{
        const results = objectSchedules.map( async (value) => {
            return await setSchedule(value, connection)
        })
        await Promise.all(results)
        await connection.commit()

        return res.status(201).json({message: '생성 성공'})
    }catch(e){
        console.log('insert sch err : \n', e)
        await connection.rollback()
    }
    finally{
        connection.release()
    }
}

const delScheduleService = async(req, res) => {
    const univName = req.body.univName;
    
    const result = await deleteSchedule(univName)
    if(result.affectedRows) res.status(204)
    else res.status(200).json({success:false});
}

module.exports = {setScheduleService, delScheduleService}