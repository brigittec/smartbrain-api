const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const mssql = require('mssql');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

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

app.post('/signin', (req, res) => {signin.signinHandler(req, res, db, bcrypt)});

app.post('/register', (req, res) => {register.registerHandler(req, res, db, bcrypt)});

app.get('/profile/:id', (req, res) => {profile.profileHandler(req, res, db)});

app.put('/image', (req, res) => {image.imageHandler(req, res, db)});
	
app.listen(3000, () => {
	console.log('app is running on port 3000');
})

