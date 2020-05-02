/**
 * Server module.
 *
 *
 */

'use strict';

var nodestatic = require('node-static');
var express = require('express');
var path = require('path');

var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 1337
var serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || 'localhost'
var socketIoServer = '192.168.0.22';

////////////////////////////////////////////////
// SETUP SERVER
////////////////////////////////////////////////

var app = express();
const cors = require("cors");

require('dotenv').config();
require('./router')(app, socketIoServer);

// Static content (css, js, .png, etc) is placed in /public
app.use(express.static(__dirname + '/public'));
app.use(cors());

// Location of our views
app.set('views',__dirname + '/views');

// Use ejs as our rendering engine
app.set('view engine', 'ejs');

// Tell Server that we are actually rendering HTML files through EJS.
app.engine('html', require('ejs').renderFile);
var server=app.listen(serverPort, function(){
    console.log("Express is running on port "+serverPort);
});

var io = require('socket.io').listen(server);

////////////////////////////////////////////////
// EVENT HANDLERS
////////////////////////////////////////////////

io.sockets.on('connection', function (socket){

	function log(){
        var array = [">>> Message from server: "];
        for (var i = 0; i < arguments.length; i++) {
	  	    array.push(arguments[i]);
        }
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
        socket.broadcast.to(socket.room).emit('message', message);
	});

	socket.on('create or join', function (message) {
        var room = message.room;
        socket.room = room;
        var participantID = message.from;
        configNameSpaceChannel(participantID);

		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room);
		} else {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		}
	});

	socket.on('chatMessage', function (msg) {
		console.log("Chat message send in room("+socket.room+"): "+msg);
	    socket.broadcast.to(socket.room).emit('chatMessage', msg);
	});

	socket.on('videochatStreaming', function (stream) {
		console.log("videochatStreaming: ("+socket.room+") "+stream.participantID);
	});

    // Setup a communication channel (namespace) to communicate with a given participant (participantID)
    function configNameSpaceChannel(participantID) {
        var socketNamespace = io.of('/'+participantID);

        socket.on('videochatStreaming', function (stream) {
			console.log("videochatStreaming: ("+socket.room+") "+stream.participantID);
		});

        socketNamespace.on('connection', function (socket){
            socket.on('message', function (message) {
                // Send message to everyone BUT sender
                socket.broadcast.emit('message', message);
            });

            socket.on('chatMessage', function (msg) {
				console.log("Chat message send in confing: "+msg);
				console.log(socket.room);
			    socket.broadcast.emit('chatMessage', msg);
			});
        });
    }

});
