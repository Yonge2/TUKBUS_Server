const request = require('request');

const privateinfo = require('../private/privatekey_Tuk');

const station_name = encodeURI('정왕');
const url = privateinfo.getMetroURL(station_name);

const getMetro = () => {
    return new Promise((resolve, reject)=>{
        let info_arr = [];
        request(url,function(err,res){
            if(err) {
                info_arr = err;
                console.log(err);
            }
            else {
                let tempbody = JSON.parse(res.body);
                let bodyList = tempbody.realtimeArrivalList;
    
                if(bodyList === undefined){ //amount of api request over
                    console.log(tempbody);
                }
                else{
                    bodyList.forEach((element) => {
                        let subinfo = {};
                        subinfo.statnNm = element.statnNm;
                        subinfo.barvlDt = element.barvlDt;
                        subinfo.bstatnNm = element.bstatnNm + "행";
                        subinfo.arvlMsg2 = element.arvlMsg2;
                        subinfo.arvlMsg3 = element.arvlMsg3;
                        info_arr.push(subinfo);
                        
                        if(bodyList.length === info_arr.length) resolve(info_arr);
                    });
                }
            }
        });
    })
}
module.exports = getMetro;
/*
statnNm : 검색한역
barvlDt : 도착예정시간
bstatnNm : 종착역
arvlMsg2 : 몇전역인지
arvlMsg3 : 현재열차위치
*/