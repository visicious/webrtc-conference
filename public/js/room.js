'use strict';

var meeting;
var host = HOST_ADDRESS; // HOST_ADDRESS gets injected into room.ejs from the server side when it is rendered

$( document ).ready(function() {
	/////////////////////////////////
	// CREATE MEETING
	/////////////////////////////////
	meeting = new Meeting(host);

	meeting.onLocalVideo(function(stream) {
	        //alert(stream.getVideoTracks().length);
	        document.querySelector('#localVideo').srcObject = stream;

	        $("#micMenu").on("click",function callback(e) {
	        	if($("#micMenu").hasClass("btn-secondary")) {
	        		$("#micMenu").removeClass("btn-secondary");
	        	} else {
	        		$("#micMenu").addClass("btn-secondary");
	        	}

				meeting.toggleMic();
    		});

    		$("#videoMenu").on("click",function callback(e) {
    			if($("#videoMenu").hasClass("btn-secondary")) {
	        		$("#videoMenu").removeClass("btn-secondary");
	        	} else {
	        		$("#videoMenu").addClass("btn-secondary");
	        	}

				meeting.toggleVideo();
    		});

    		$("#micTest").on("click",function callback(e) {
    			if ($("#localVideo").prop('muted')) {
    				$("#localVideo").prop('muted', false);
    				$("#micTest").removeClass("btn-secondary");
    			} else {
    				$("#localVideo").prop('muted', true);
    				$("#micTest").addClass("btn-secondary");
    			}
    			console.log($("#localVideo").prop('muted'));
    		});

    		$("#micTest").addClass("btn-secondary");
			$("#localVideo").prop('muted', true);

	    }
	);

	meeting.onRemoteVideo(function(stream, participantID) {
			// console.log(stream.getVideoTracks());
			// console.log(participantID);
			// stream.onactive = function (e) {
	  //           console.log(stream.mimeType);
	  //           // socket.emit('videochatStreaming', {participantID: participantID, stream:e.data});
   //        	}
	        addRemoteVideo(stream, participantID);
	    }
	);

	meeting.onParticipantHangup(function(participantID) {
			// Someone just left the meeting. Remove the participants video
			removeRemoteVideo(participantID);
		}
	);

    meeting.onChatReady(function() {
			console.log("Chat is ready");
	    }
	);

    var room = window.location.pathname.match(/([^\/]*)\/*$/)[1];
	meeting.joinRoom(room);
	meeting.createChatRoom('chat','text-message-box','text-messages');

}); // end of document.ready

function addRemoteVideo(stream, participantID) {
    var $videoBox = $("<div class='videoWrap' id='"+participantID+"'></div>");
    var $video = $("<video class='videoBox' autoplay></video>");
    $video.attr({"srcObject": stream, "autoplay": "autoplay"});
    var videoBoxUpdate = $video[0];
    videoBoxUpdate.srcObject = stream;
    $videoBox.append($video);
	$("#videosWrapper").append($videoBox);
	adjustVideoSize();
}

function removeRemoteVideo(participantID) {
	$("#"+participantID).remove();
	adjustVideoSize();
}

function adjustVideoSize() {
	var numOfVideos = $(".videoWrap").length;
	if (numOfVideos>2) {
		var $container = $("#videosWrapper");
		var newWidth;
		for (var i=1; i<=numOfVideos; i++) {
			newWidth = $container.width()/i;

			// check if we can start a new row
			var scale = newWidth/$(".videoWrap").width();
			var newHeight = $(".videoWrap").height()*scale;
			var columns = Math.ceil($container.width()/newWidth);
			var rows = numOfVideos/columns;

			if ((newHeight*rows) <= $container.height()) {
				break;
			}
		}

		var percent = (newWidth/$container.width())*100;
		$(".videoWrap").css("width", percent-5+"%");
		$(".videoWrap").css("height", "auto");


		//var numOfColumns = Math.ceil(Math.sqrt(numOfVideos));
		var numOfColumns;
		for (var i=2; i<=numOfVideos; i++) {
			if (numOfVideos % i === 0) {
				numOfColumns = i;
				break;
			}
		}
	    $('#videosWrapper').find("br").remove();
		$('.videoWrap:nth-child('+numOfColumns+'n)').after("<br>");
	} else if (numOfVideos == 2) {
		$(".videoWrap").width('auto');
		$("#localVideoWrap").css("width", 20+"%");
		$('#videosWrapper').find("br").remove();
	} else {
		$("#localVideoWrap").width('auto');
		$('#videosWrapper').find("br").remove();
	}
}