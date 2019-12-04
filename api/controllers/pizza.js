'use strict'
const db = require('../db');
const uuid = require('uuid')


function get(req, res)
{
	return getAsync(req, res);
}

function create(req, res)
{
	return createAsync(req, res);
}

function del(req, res)
{
	return delAsync(req, res);
}

function put(req, res)
{
	return putAsync(req, res);
}

function buy(req, res)
{
	return buyAsync(req, res);
}

async function getAsync(req, res)
{
    let id = req.swagger.params.id.value;
    const pizzas = await db.getPizzas();
    let pizza = null;

    pizzas.forEach(p => {
        if (p.id == id) {
            pizza = p;
            return;
        }
    }); 

    if (pizza === null) {
        res.status(400).send({
			message: 'Pizza not found.'
		});
    }
    res.json(pizza);
}

async function createAsync(req, res)
{
    let pizzas = await db.getPizzas();
    let pizza = req.swagger.params.pizza.value;
    
    pizza.id = uuid.v4();
    
	pizzas.push(pizza);

	db.updatePizzas(pizzas);

	res.json(pizza);
}

async function putAsync(req, res)
{
    let pizzas = await db.getPizzas();

    let pizza = req.swagger.params.pizza.value;
    let pizzaId = req.swagger.params.id.value;

    let isNew = true;

    pizzas.forEach(function (p, i) {
        if (p.id == pizzaId) {
            pizzas.splice(i, 1);
            pizza.id = pizzaId;
            pizzas.push(pizza);
            isNew = false;
            return;
        }
    });

    if (isNew) {
        pizza.id = uuid.v4();
        pizzas.push(pizza);
    }

    db.updatePizzas(pizzas);

    res.json(pizza);
}

async function delAsync(req, res)
{
    let pizzaId = req.swagger.params.id.value;
    let pizzas = await db.getPizzas();
    let deleted = false;

    pizzas.forEach(function (p, i) {
        if (p.id == pizzaId) {
            pizzas.splice(i, 1);
            deleted = true;
            return;
        }
    });

    db.updatePizzas(pizzas);

    if (deleted) {
        res.status(200).send({
            message: 'Pizza deleted.'
        });
    } else {
        res.status(400).send({
            message: 'Pizza not found.'
        });
    }
}

async function buyAsync(req, res)
{
    let pizzaId = req.swagger.params.pizzaId.value;
    let sessions = await db.getSessions();
    let users =  await db.getUsers();
    let pizzas = await db.getPizzas();

    let session = null;
    let user = null;
    let pizza = null

    pizzas.forEach(p => {
        if (p.id == pizzaId) {
            pizza = p;
            return;
        }
    });

    if (pizza === null) {
        return res.status(400).send({
			message: 'Pizza not found.'
		});
    }

    sessions.forEach(s => {
        if (s._sessionId == req.header('X-Session-ID')) {
            session = s;
            return;
        }
    });

    users.forEach(function (u, i) {
        if (u.id == session._userId) {
            users.splice(i, 1);
            user = u;
            return;
        }
    });

    // kupon kedvezmenyek
    let price = pizza.price;
    if (user.coupon > 0) {
        price -= 100;
        user.coupon -= 1;
    }

    if (pizza.size >= 2) {
        user.coupon += 1
    }

    if (pizza.size >= 3) {
        user.coupon += 2
    }

    if (user.money < price) {
        return res.status(400).send({
            message: 'No money.'
        });
    }

    user.money -= price;

    users.push(user);

    // rendeles hozzaadasa
    pizza.userId = user.id;
    let orders = [];
    orders.push(pizza);

    db.updateUsers(users);
    db.updateOrders(orders);

    return res.status(200).json(pizza);
}

module.exports = {
	get,
	create,
    del,
    put,
    buy
}