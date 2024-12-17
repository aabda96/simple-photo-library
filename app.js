const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const path = require('path');
const albumRoute = require('./routes/album.routes');

const app = express();

mongoose.connect('mongodb://127.0.0.1/phototheque');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const port = 3000;

const logRequest = (req, res, next) => {	
	console.log('===LogRequest===');
	console.log(`[${req.method}] - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} "${req.originalUrl}"`);
	next();
};

app.use(logRequest);

app.get('/', (req, res) => {
	res.redirect('/albums');
});

app.use('/albums', albumRoute);

app.use((req, res) => {
	res.status(404);
	res.send('Erreur 404');
});

app.listen(port, () => {
	console.log(`Server running on localhost:${port}`);
});