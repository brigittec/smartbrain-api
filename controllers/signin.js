const signinHandler = (req, res, db, bcrypt) => {
    const {email, password} = req.body; //destructuring
    
    if (!email || !password){
       return res.status(400).json('Please fill in all the fields to register');
    }

	db.select('email', 'hash')
	.from('login')
	.where('email', '=', email)
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		console.log(isValid);
		if (isValid) {
			return db.select('*').from ('users')
			.where ('email', '=', email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.json(400).json('Error signin in'))
		} else {
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))
}
module.exports = {
    signinHandler: signinHandler  
}