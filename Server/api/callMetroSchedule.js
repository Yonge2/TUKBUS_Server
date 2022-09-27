const request = require('request');

const privateinfo = require('../../../private/privatekey_Tuk');

const station_name = encodeURI('정왕');

const url = privateinfo.getMetroURL(station_name);

module.exports.getMetro = function getmetro() {
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
                bodyList.forEach((element, index) => {
                    let subinfo = {};
                    subinfo.statnNm = bodyList[index].statnNm;
                    subinfo.barvlDt = bodyList[index].barvlDt;
                    subinfo.bstatnNm = bodyList[index].bstatnNm + "행";
                    subinfo.arvlMsg2 = bodyList[index].arvlMsg2;
                    subinfo.arvlMsg3 = bodyList[index].arvlMsg3;
                    info_arr.push(subinfo);
                });
                console.log('subway data get success'); 
                console.log(bodyList);
            }
        }
    });
    return info_arr;
}
/*
statnNm : 검색한역
barvlDt : 도착예정시간
bstatnNm : 종착역
arvlMsg2 : 몇전역인지
arvlMsg3 : 현재열차위치
*/