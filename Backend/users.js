const bcrypt = require('bcryptjs');

const users = [
    {
        id: '1',
        email: 'user@gmail.com',
        password: bcrypt.hashSync('Passwor123', 10),
        role: 'user',
    },
];

module.exports = users;