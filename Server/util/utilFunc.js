/**
 * create random number with digits
 * @param {Integer} digits 
 * @returns {String} random number
 */
const makeRandomNum = (digits) =>{
    let multip = 0;
    switch(digits){
        case 2: 
            multip = 100;
            break;
        case 3:
            multip = 1000;
            break;
        case 4:
            multip = 10000;
            break;
    }
    let ranNum = Math.floor((Math.random()*multip)).toString();
    
    if(ranNum.length <digits) return "0"+ranNum;
    else return ranNum;
}

module.exports = {makeRandomNum};