

const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{

        console.log('connection');
        socket.join(socket.roomID);
        console.log(socket.roomID," / ", socket.userID);


        //return userID
        chat.to(socket.roomID).emit("in", socket.userID);
        
        //data{roomID, message, sender, sendTime}
        socket.on('chat message', async(data)=>{
            data.roomID = socket.roomID;
            data.userID = socket.userID;

            chat.to(socket.roomID).emit('chat message', {
                userID : data.userID,
                msg : data.msg,
                time : data.sendTime
            });
        })
    
        socket.on('disconnect', async()=>{
            //퇴장이벤트
            chat.to(socket.roomID).emit('out', socket.userID);           
            console.log('dis');
        })

        socket.on('reconnection', async()=>{
            console.log('recon');
        })
    })
}
 


module.exports = chatting;