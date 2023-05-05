const request = require('request');

const privateinfo = require('../private/privatekey_Tuk');

const station_name = encodeURI('정왕');

const sortingMetro = async()=>{
    let data = await getMetro(0);
    data.push(await getMetro(1));

    let sortingSubInfo = [];
    let upline4 = [];
    let downline4 = [];
    let uplineSu = [];
    let downlineSu = [];

    data.forEach((ele)=>{
        if(ele.subwayId==='1004'){
            if(ele.updnLine === '상행') upline4.push(ele);
            else if(ele.updnLine === '하행') downline4.push(ele);
        }
        else if(ele.subwayId==='1075'){
            if(ele.updnLine === '상행') uplineSu.push(ele);
            else if(ele.updnLine === '하행') downlineSu.push(ele);
        }
    });

    sortingSubInfo.push(priorSub(upline4));
    sortingSubInfo.push(priorSub(downline4));
    sortingSubInfo.push(priorSub(uplineSu));
    sortingSubInfo.push(priorSub(downlineSu));

    return sortingSubInfo;
}

module.exports = {sortingMetro};

const getMetro = (index) => {
    return new Promise((resolve, reject)=>{
        const url = privateinfo.getMetroURL(station_name, index);
        let info_arr = [];
        request(url,function(err,res){
            if(err) {
                info_arr = err;
                console.log('subway request err : ', err);
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
                        subinfo.subwayId = element.subwayId;
                        subinfo.updnLine = element.updnLine;
                        subinfo.statnNm = element.statnNm;
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

const priorSub = (arr)=>{
    let min=50;
    let prior = {};
    for(let i=0; i<arr.length; i++){
        if(arr[i].arvlMsg2==='정왕 도착') continue;
        else{
            if(arr[i].arvlMsg2==='정왕 진입') return arr[i];
            else{
                if(arr[i].arvlMsg2==='전역 도착') return arr[i];
                else{
                    if(arr[i].arvlMsg2==='전역 진입') return arr[i];
                    else{
                        const tostring = (arr[i].arvlMsg2.substring(3,4)===']')?parseInt(arr[i].arvlMsg2.substring(1,3)) : parseInt(arr[i].arvlMsg2.substring(1,2));
                        if(tostring<min){
                            min=tostring;
                            prior = arr[i];
                        }
                    }
                }
            }
        }
        return prior;
    }
}