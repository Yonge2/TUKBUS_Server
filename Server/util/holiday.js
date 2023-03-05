const request = require('request');
const {XMLParser} = require('fast-xml-parser');
const holiday_url = require('../private/privatekey_Tuk');
const dayjs = require('dayjs');

const xmlParser = new XMLParser();

//return promise after either today is holiday or not
const getHolidays = (year, month)=>{
    let holiday_arr = [];
    return new Promise((resolve, reject)=>{
        console.log(new dayjs().format('YYYYMMDD'));
        const url = holiday_url.hoilday_url(year, month);
        request.get(url, (err, res, body) => {
            if(err){
                reject(err);
            }
            else {
                try {
                    const xml2json = xmlParser.parse(body);
                    const holidays = xml2json.response.body.items?.item;
                    if(holidays){
                        if(holidays.length){
                            holidays.forEach((element) => {
                                holiday_arr.push(String(element.locdate));
                            });
                            resolve(holiday_arr);
                        }
                        else {
                            holiday_arr.push(String(holidays.locdate));
                            resolve(holiday_arr);
                        }
                    }
                    else {
                        reject(holiday_arr);
                    }
                }
                catch(err){
                    reject("holiday api요청 err : "+err);
                }
            }
        })
    })
}
module.exports = getHolidays;
