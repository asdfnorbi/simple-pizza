'use strict'
const db = require('../db');
const uuid = require('uuid');

function createUser(req, res)
{
	return createUserAsync(req, res);
}

async function createUserAsync(req, res)
{
	let users = await db.getUsers();

	const user = req.swagger.params.signup.value;

	let id = uuid.v4();

	if(users.filter(x => x.id == id || x.email == user.email).length > 0) 
	{
		res.status(400).send('User with the specified email already exists!');
		return;
	}
		
    user.id = id;
    user.coupon = 1; // kezdetnek kap egy kupont
    user.money = 1000;

	users.push(user);

	db.updateUsers(users);

	res.json(id);
}

function login(req, res)
{
	return loginAsync(req, res);
}

async function loginAsync(req, res)
{
	let credentials = req.swagger.params.login.value;
	console.log(credentials);

	try {
		let user = await findUserByCredentials(credentials);
		let sessionId = await createNewSession(user);

		res.status(200).send({'SessionId': sessionId});
	} catch (error) {
		console.error(error);
		res.status(401).send(error.message);
	}
}

async function findUserByCredentials(credentials)
{
	let users = await db.getUsers();
	let filtered = users.filter(x => (x.email === credentials.email && x.password === credentials.password));
	if(filtered.length == 0)
	{
		throw new Error('Invalid credentials');
	}

	return filtered[0];
}

async function createNewSession(user)
{
	let sessions = await db.getSessions();

	let sessionId = uuid.v4();

	sessions.push({_sessionId: sessionId, _userId: user.id});

	db.updateSessions(sessions);

	return sessionId;
}

function logout(req, res)
{
	return logoutAsync(req, res);
}

async function logoutAsync(req, res)
{
	let sessionId = req.header('X-Session-Id');

	let sessions = await db.getSessions();

	if(sessions.filter(x => x._sessionId === sessionId).length > 0)
	{
		sessions = sessions.filter(x => x._sessionId !== sessionId);
		db.updateSessions(sessions);

		res.status(400).send({
			message: 'Logout'
		});
	}
	else
	{
		res.status(400).send({
			message: 'Unknown session id.'
		});
	}
}

module.exports = {
	createUser,
	login,
	logout
}
