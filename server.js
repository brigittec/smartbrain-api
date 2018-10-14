const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const mssql = require('mssql');

const app = express();

const db = knex({
	client: 'mssql',
	connection: {
		server: '127.0.0.1',
		user: 'sa',
		password: 'Pa33w0rd',
		database: 'SmartBrain',
		port: 1433,
		options: {
			encrypt: false // Use this if you're on Windows Azure
			,instanceName: 'SQL2014'
		}
	}
});

db.select('*').from('users').then(data => {console.log(data)});

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	db.select('email', 'hash')
	.from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		console.log(isValid);
		if (isValid) {
			return db.select('*').from ('users')
			.where ('email', '=', req.body.email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.json(400).json('Error signin in'))
		} else {
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const {email, name, password} = req.body; //destructuring
	const hash = bcrypt.hashSync(password);

	// bcrypt.hash(password, null, null, function(err, hash) {
	// 	console.log(hash);
	// })
	db.transaction(trx => {
		trx.insert({
			hash: hash, 
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to register'));
})

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	let found = false;

	db.select('*')
	.from('users')
	.where({id})
	.then(user => {
		if (user.length) {
			res.json(user[0])
		} else {
			res.status(400).json('Not found');
		}
		
	})
	.catch(err => res.status(400).json('Error finding user'));
})

app.put('/image', (req, res) => {
	const {id} = req.body;
	db('users')
	.where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => res.json(entries[0]))
	.catch(err => res.status(400).json('Unable to get Entries'))
})
	

app.listen(3000, () => {
	console.log('app is running on port 3000');
})

