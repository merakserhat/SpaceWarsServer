var app = require("express")();
var server = require("http").Server("app");
var io = require("socket.io")(server);
var randomRoomCreator = require("./random_room_id");
var rooms = [];
var players = [];


server.listen(8080, function(){
    console.log("Server is running now")
})

io.on("connection" , function(socket){
    socket.emit("socketID",{id : socket.id});
    console.log("Player connected id:" + socket.id);
    players.push(socket);

    socket.on("touched",function(data){
        data.id = socket.id;
        console.log(socket.id + " touched " + socket.room)
        if(socket.room)
            socket.broadcast.to(socket.room).emit("touched",data);

    });

    socket.on("createRandomRoom",function(){
        if(socket.room)
            socket.leave(socket.room);

        var room = randomRoomCreator.getRandomId();
        while(rooms.includes(room)){
            room = randomRoomCreator.getRandomId();
        }
        rooms.push(room);

        console.log("Socket now in rooms", socket.rooms);

		socket.join(room);
		socket.room = room;
		socket.builder = true;

		socket.emit("roomCreated",{roomId : room})

		console.log("rooms length :" + rooms.length)
		console.log(rooms);
		console.log(rooms.includes(room))
    });

    socket.on("joinToRoom",function(data){
        if(rooms.includes(data)){
            if(!RoomIsFull(data)){
                if(socket.room) socket.leave(socket.room);

                socket.join(data);
                socket.builder = false;
                socket.room = data;
                console.log(rooms)
                socket.emit("joinedToRoom",{roomId : data});
                socket.broadcast.to(data).emit("newPlayerJoined",{playerId:socket.id})
            }else{
                socket.emit("roomIsFull")
            }
        }else{
            socket.emit("roomNotFound");
        }

        console.log(rooms)
    })

    socket.on("setPlayerPos",function(x,y,a,c){
        socket.broadcast.to(socket.room).emit("setPlayerPos",{x : x,y : y,a : a,c : c})
    })
    socket.on("playerAttacked",function(x,y){
        socket.broadcast.to(socket.room).emit("playerAttacked",{x : x,y : y});
    })

    socket.on("getOtherPlayer",function(roomId){
        for(var i=0;i<players.length;i++){
            if(players[i].room == roomId && players[i].id != socket.id){
                socket.emit("getOtherPlayer",{otherPlayerId : players[i].id});
            }
        }
    })

    socket.on("leftFromRoom", function(){
        PlayerleftFromRoom(socket);
    })

    socket.on("disconnect", function(){
        console.log("Player disconnected id:" + socket.id);

        for(var i=0;i<players.length;i++){
            console.log(players[i].id)
            if(players[i].id == socket.id)
                players.splice(i, i + 1);
        }

        if(socket.room){
            console.log("socket.builder :" + socket.builder)
            PlayerleftFromRoom(socket);
        }
    })
})

function PlayerleftFromRoom(socket){
    if(socket.builder){
        for(var i=0;i< rooms.length;i++){
            if(socket.room == rooms[i])
                rooms.splice(i,i+1);
        }

        for(var i=0;i<players.length;i++){
            if(players[i].room && socket.room == players[i].room){
                players[i].leave(players[i].room);
                players[i].room = null;
                players[i].emit("roomClosed");
            }

        }

    }else {
        for(var i=0;i<players.length;i++){
            console.log(socket.room == players[i].room)
            if(players[i].room && socket.room == players[i].room){
                console.log("girdi")
                players[i].emit("playerLeft");
            }
        }
    }


    socket.leave(socket.room)
    socket.room = null;
}

function RoomIsFull(room){
    var playerLength = 0;
    for(var i=0;i< players.length;i++){
        if(players[i].room && players[i].room == room){
            playerLength++;
        }
    }

    if(playerLength == 2) return true;
    else return false;
}

