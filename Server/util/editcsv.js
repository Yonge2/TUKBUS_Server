const fs = require("fs");
const path = require("path");


module.exports.sch_weekday_json = function sch_weekday_json(){

    const WeekDay_csv = "Bus_sch_weekday.csv";
    const csvPath_weekday = path.join(__dirname, '..', 'csvdir', WeekDay_csv);
    const csv_weekday = fs.readFileSync(csvPath_weekday, "UTF-8");
    const schedule_weekday = csv2json_sch(csv_weekday);

    return schedule_weekday;
}

module.exports.sch_weekend_json = function sch_weekend_json(){

    const Weekend_csv = "Bus_sch_weekend.csv";
    const csvPath_weekend = path.join(__dirname, '..', 'csvdir', Weekend_csv);
    const csv_weekend = fs.readFileSync(csvPath_weekend, "UTF-8");
    const schedule_weekend = csv2json_sch(csv_weekend);

    return schedule_weekend;
}


function csv2json_sch(csv){

    const rows = csv.split("\r\n");

    let toTUK_data = [];
    let toStation_data = [];
    let title = [];
    let detail = [];
    
    if(rows[rows.length-1] == ''){
        rows.pop();
    }
    console.log(rows);
        //to able to korean, Add "\uFEFF" + data 
    for (const i in rows){
    
        const data = rows[i].split(",")
        
        if(i==="0") title = data;
                    
        else {
            detail = data;
            let toTUK_row = {};
            let toStation_row = {};

            switch(title[3])
            {
                case "day" : 
                for(const k in detail){
                    if(detail[0] == "TUK"){
                        toTUK_row.seq = "T"+i;
                        toTUK_row.hour = Number(detail[1]);  
                        toTUK_row.min = Number(detail[2]);
                        toTUK_row.destination = detail[0];
                        toTUK_row.day = detail[3];
                    }
                    if(detail[4] == "Station"){
                        toStation_row.seq = "S"+i;
                        toStation_row.hour = Number(detail[5]);
                    toStation_row.min = Number(detail[6]);
                        toStation_row.destination = detail[4];
                        toStation_row.day = detail[7];
                    }
                }
                break;

                case "continuity" :
                for(const j in detail){
                    if(detail[0] == "TUK"){
                        toTUK_row.seq = "T"+i;
                        toTUK_row.hour = Number(detail[1]);
                        toTUK_row.min = Number(detail[2]);
                        toTUK_row.destination = detail[0];
                        toTUK_row.continuity = detail[3];
                    }
                    if(detail[4] == "Station"){
                        toStation_row.seq = "S"+i;
                        toStation_row.hour = Number(detail[5]);
                        toStation_row.min = Number(detail[6]);
                        toStation_row.destination = detail[4];
                        toStation_row.continuity = detail[7];
                    }
                }
                break;

                default : 
                console.log("csv parse err")
                break;
            }
            if(Object.keys(toTUK_row).length !== 0) toTUK_data.push(toTUK_row);
            if(Object.keys(toStation_row).length !== 0) toStation_data.push(toStation_row);
        }
    }
    let bus_sch = [];
    bus_sch.push(...toTUK_data);
    bus_sch.push(...toStation_data);
    
    return bus_sch;
}