const fs = require("fs");
const path = require("path");


const schWeekdayJson = () => {

    const fileName = "Bus_sch_weekday.csv";
    const csvPath = path.join(__dirname, '..', 'csvdir', fileName);
    const csv_weekday = fs.readFileSync(csvPath, "UTF-8");
    const schedule_weekday = scheduleCsvToJson(csv_weekday);

    return schedule_weekday;
}

module.exports = {schWeekdayJson}

const scheduleCsvToJson = async(csv) =>{
    const rows = csv.split("\r\n");
    console.log(rows.length);

    let destination1 = [];
    let destination2 = [];

    if(rows[rows.length-1] === '') rows.pop();
    rows.shift();

    rows.map((ele)=>{
        const data = ele.split(",");
        const destination1_row = {
            destination: data[0],
            hour: parseInt(data[1]),
            min: parseInt(data[2]),
            continuity: (!!parseInt(data[3]))
        };
        const destination2_row = {
            destination: data[4],
            hour: parseInt(data[5]),
            min: parseInt(data[6]),
            continuity: (!!parseInt(data[7]))
        };
        if(destination1_row.destination != '') destination1.push(destination1_row);
        if(destination2_row.destination != '') destination2.push(destination2_row);
    })

    let busSch = [];
    busSch.push(...destination1);
    busSch.push(...destination2);
    return busSch;
}