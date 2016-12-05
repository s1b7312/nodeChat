var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var usersOnline = 0;
var roomNo = 1;
var requests = [];
var sockets = [];
var unAssigned = [];
var rooms = ['sports', 'music', 'politics'];

app.use(express.static('src'));

io.on('connection', function(socket) {
    console.log('connected: ', socket.id);
    usersOnline += 1;
    sockets.push(socket.id);
    requests[socket.id] = {};
    console.log('users: ', usersOnline);

    io.sockets.connected[socket.id].emit('rooms', rooms);       // send available rooms to user

    socket.on('join', function(data){
        console.log(socket.id, 'wants to join', data.room);
        unAssigned.push(socket.id);
        io.sockets.connected[socket.id].emit('response', 'Your request has been recieved');
        requests[socket.id].room = data.room;
        requests[socket.id].name = data.name;
        requests[socket.id].email = data.email;
        requests[socket.id].assigned = false;
    });

    socket.on('message', function(msg) {
        var room = requests[socket.id].room;
        var name = requests[socket.id].name;
        console.log(msg, 'to room', room, 'from', name);
        io.sockets.in(room).emit('message', name + ':' + msg);
    })

    socket.on('disconnect', function() {
        console.log(socket.id + ' disconnected');
        usersOnline -= 1;
    });
});

http.listen(57231, function() {
    console.log('listening on *:57231');
});

var assignRooms = function() {
    while(unAssigned.length > 0) {
        console.log('.');
        var socketId = unAssigned[0];
        unAssigned.splice(0, 1);
        // if(io.nsps['/'].adapter.rooms["room-" + roomNo] && io.nsps['/'].adapter.rooms["room-" + roomNo].length == 2)
        //     roomNo++;

        var room = requests[socketId].room;
        if(rooms.indexOf(room) > -1) {
            io.sockets.connected[socketId].join(room);
            console.log(requests[socketId].name + ' joined room ' + room);
            // io.sockets.in(room).emit('connected', socketId + ' joined ' + room + ' room');               //  send to all in room
            io.sockets.connected[socketId].broadcast.to(room).emit('inRoom', requests[socketId].name + ' joined');      //  send to all except sender
            io.sockets.connected[socketId].emit('inRoom', 'You are now in the ' + room + ' room');       //  send only to the sender
            requests[socketId].assigned = true;
        }
        else {
            io.sockets.connected[socketId].emit('error', 'Requested room could not be found');
        }
    }
}
setInterval(assignRooms, 3000);