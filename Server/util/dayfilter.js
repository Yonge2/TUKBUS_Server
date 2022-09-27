
function dayFilter() {
    return new Promise((resolve, reject) => {

        let nowTime = [];
        const now = new Date();
        const nowHour = now.getHours();
        const nowMin = now.getMinutes();
        const nowDay = now.getDay();

        switch (nowDay)
        {
            //일요일
            case 0 : 
            if(nowHour < 9 || nowHour > 19) {
                reject('운행종료');
                break;
            }
            else{
                nowTime.hour = nowHour;
                nowTime.min = nowMin;
                nowTime.day = 0;
                resolve(nowTime);
                break;           
            }
    
            //토요일
            case 6 : 
            if(nowHour < 9 || nowHour > 19) {
                reject('운행종료');
                break;
            }
            else{
                nowTime.hour = nowHour;
                nowTime.min = nowMin;
                nowTime.day = 1;
                resolve(nowTime); 
                break;           
            }
           
            //평일
            default : 
            if(nowHour < 8 || nowHour > 22) {
                reject('운행종료');
                break;
            }
            else{
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
