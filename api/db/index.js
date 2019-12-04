const uuid = require('uuid')
const { promisify } = require('util');
const fs = require('fs');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const indentBy = 4;

module.exports = {
    getSessions: async () => {
        let sessions = await readFileAsync('./sessions.json');
        return JSON.parse(sessions);
    },
    getUsers: async () => {
        let users = await readFileAsync('./users.json');
        return JSON.parse(users);
    },
    getPizzas: async () => {
        let pizzas = await readFileAsync('./pizzas.json');
        return JSON.parse(pizzas);
    },
    updateSessions: async (sessions) => {
        await writeFileAsync('./sessions.json', JSON.stringify(sessions, null, indentBy));
    },
    updateUsers: async (users) => {
        await writeFileAsync('./users.json', JSON.stringify(users, null, indentBy));
    },
    updatePizzas: async (pizzas) => {
        await writeFileAsync('./pizzas.json', JSON.stringify(pizzas, null, indentBy));
    },
    updateOrders: async (orders) => {
        await writeFileAsync('./orders.json', JSON.stringify(orders, null, indentBy));
    },
}