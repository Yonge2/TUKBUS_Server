const request = require('request');

const kakaoAuth = require('../private/privatekey_Tuk').kakaoApi;


const getDurtion = async (direction ,hour, min) => {
    return new Promise((resolve, rject)=>{
        let url = kakaoAuth.setFutureRouteSearchParams(direction, hour, min);
        request(url, {headers: {Authorization: `KakaoAK ${kakaoAuth.auth}`}}, (err, res)=>{
                if(err) rject(err);
                else {
                    const data = JSON.parse(res.body);
                    const duration = data.routes[0].summary.duration;
                    resolve(duration);
                }
            })
    });
}

module.exports = getDurtion;