/**
 * This module serves as the router to the different views. It handles
 * any incoming requests.
 *
 * @param app An express object that handles our requests/responses
 * @param socketIoServer The host address of this server to be injected in the views for the socketio communication
 */

'use strict';
const Users = require('./models/users');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const moment = require('moment');
const express = require('express');

const createToken = (user) => {
	var payload = {
		userId: user.id
	}

	return jwt.encode(payload, process.env.TOKEN_KEY);
};

module.exports=function(app, socketIoServer) {
    app.get('/',function(req,res){
        res.render('login');
    });

    app.get('/home/:token',function(req,res){
    	try {
    		const tokenDecoded = jwt.decode(req.params.token,process.env.TOKEN_KEY);
    		res.cookie('token', req.params.token, { domain: 'localhost' }).render('home');
    	} catch(err) {
    		console.log(err);
    		res.json({ error: "Necesita hacer login para ver esta página" });
    	}
    });

    app.get('/salas/:path/:token',function(req,res){
    	try {
    		var path = req.params.path;
		    console.log(path);
			console.log("Requested room "+path);
    		const tokenDecoded = jwt.decode(req.params.token,process.env.TOKEN_KEY);
		    res.cookie('token', req.params.token, { domain: 'localhost' }).render('room', {"hostAddress":socketIoServer});
    	} catch(err) {
    		console.log(err);
    		res.json({ error: "Necesita hacer login para ver esta página" });
    	}

    });

	app.get('/api/obtener_usuarios', async (req,res) => {
        const users = await Users.getAll();
        res.json(users);
    });

    app.post('/api/registrar_usuarios', async (req,res) => {
    	console.log(req.body);
    	req.body.pass = bcrypt.hashSync(req.body.pass, 10);
        const result = await Users.insert(req.body);
        res.json(result);
    });

    app.post('/api/login', async (req,res) => {
    	console.log(req.body);
        const user = await Users.getByEmail(req.body.email);
        if (user === undefined) {
        	res.json({
        		error: 'Correo no encontrado'
        	});
        } else {
        	const hashPass = bcrypt.compareSync(req.body.pass, user.pass);
        	if(hashPass != null) {
        		res.json({
        			successful: createToken(user),
        			done: 'Login exitoso'
        		});
        	}
        }
    });
}