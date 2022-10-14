const request = require('request');
const {XMLParser} = require('fast-xml-parser');
const holiday_url = require('../../../private/privatekey_Tuk');

const xmlParser = new XMLParser();

module.exports = {

    getTodayObj : ()=>{
        let todayObj = {};
        const day = new Date();
    
        todayObj.year = String(day.getFullYear());
        if(day.getMonth()>8){
            todayObj.month = String(day.getMonth()+1);
        }
        else todayObj.month = "0" + String(day.getMonth()+1);
    
        const tempstr1 = String(day.toJSON(day)).split('-');
        const tempstr2 = String(tempstr1[2]).split('T');
        todayObj.today = tempstr1[0] + tempstr1[1] + tempstr2[0];
            
        return todayObj;
    },


    getHolidays : (year, month)=>{
        let holiday_arr = [];
        return new Promise((resolve, reject)=>{
            console.log(year, month);
            const url = holiday_url.hoilday_url(year, month);       
            request.get(url, (err, res, body) => {
                if(err){
                    reject(err);
                }
                else {
                    try {
                        const xml2json = xmlParser.parse(body);
                        const holidays = xml2json.response.body.items.item;
                        if(holidays != undefined){
                            holidays.forEach((element, index) => {
                                holiday_arr.push(String(holidays[index].locdate));
                            });
                            resolve(holiday_arr);
                        }
                        else reject(holiday_arr);
                    }
                    catch(err){
                        reject("holiday api요청 err : "+err);
                    }
                }
            })
        })
    }
}
