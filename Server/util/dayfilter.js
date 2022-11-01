function dayFilter(operation_CODE) {
    return new Promise((resolve, reject) => {

        let nowTime = [];
        const now = new Date();
        const nowHour = now.getHours();
        const nowMin = now.getMinutes();
        const nowDay = now.getDay();

        if(!operation_CODE) {
            reject('운행종료');
        }
        else{
            switch (nowDay)
            {
                //일요일
                case 0 : 
                    nowTime.hour = nowHour;
                    nowTime.min = nowMin;
                    nowTime.day = 0;
                    resolve(nowTime);
                    break;           
        
                //토요일
                case 6 : 
                    nowTime.hour = nowHour;
                    nowTime.min = nowMin;
                    nowTime.day = 1;
                    resolve(nowTime); 
                    break;           
               
                //평일
                default : 
                    nowTime.hour = nowHour;
                    nowTime.min = nowMin;
                    nowTime.day = 2;
                    resolve(nowTime);
                    break;
            }     
        }
    });
}
module.exports.dayFilter = dayFilter;
