const scheduler = require('node-schedule');
const sub_request = require('./callMetroSchedule');
const holiday = require('./holiday');

module.exports = {

    holiday_schedulerJob : (Get_Option_Obj)=> {
        console.log('holiday check (1시)');
        const todayObj = holiday.getTodayObj();

        holiday.getHolidays(todayObj.year, todayObj.month)
        .then((holiday_arr)=>{
            //check holiday
           if(holiday_arr.indexOf(todayObj.today) === -1) {
            Get_Option_Obj.holiday_CODE = 1;
            console.log('not holiday');
           }
            //holiday
            else {
                Get_Option_Obj.holiday_CODE = 0;
                console.log('holiday');
            }
        })
        .catch((err) => {
            if(err === []){
                console.log('There is not holiday this month');
                Get_Option_Obj.holiday_CODE = 1;
            }
            else {
                console.log(err);
                Get_Option_Obj.holiday_CODE = 1;
            }
        })
        return Get_Option_Obj;
    },

    operation_Start_schedulerJob : (Get_Option_Obj)=> {
        console.log('subway service start(8시)');
        if(Get_Option_Obj.holiday_CODE){
            Get_Option_Obj.operation_CODE = 1;
            Get_Option_Obj.intervalID = setInterval(()=>{
                Get_Option_Obj.sub_INFO = sub_request.getMetro();
            }, 60*1000);
        }
        else {
            Get_Option_Obj.operation_CODE = 0;
            Get_Option_Obj.sub_INFO = [];
        }
        return Get_Option_Obj;
    },

    operation_Stop_schedulerJob : (Get_Option_Obj)=> {
        console.log('subway service stop(23시)');
        Get_Option_Obj.operation_CODE = 0;
        clearInterval(Get_Option_Obj.intervalID);
        Get_Option_Obj.sub_INFO = [];
        return Get_Option_Obj;
    }
}