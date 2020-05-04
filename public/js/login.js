'use strict';

var roomUrl;

$( document ).ready(function() {
    login();

}); // end of document.ready

/**
 * Set the href for the room
 *
 *
 */
function login() {
    $('#login-form').on('submit',function(e){
    	$.ajax({
		  	contentType: 'application/json',
		  	type: "POST",
		  	url: '/api/login',
		  	data: JSON.stringify({ email: $('#email').val(), pass: $('#pass').val() }),
		  	success: function(data) {
		  		if (data.successful != null) {
		  			window.location.href = "/home/"+data.successful;
		  		} else {
		  			alert("Contraseña o email errados. Intente nuevamente");
		  		}
		  	}
		});

    	e.preventDefault();
    });
}