const Album = require('../models/Album');
const path = require('path');
const fs = require('fs');
const mimeMatch = require('mime-match');
const rimraf = require('rimraf');

const errorHandlingMessage = [
	"Le titre ne peux pas être vide",
	"L'album recherché n'existe pas",
	"Erreur lors de l'upload de l'image",
	"Aucun fichier mis en ligne",
	"Vous ne pouvez upload que des images",
	"L'image que vous essayez de supprimer n'existe pas"
];

const catchError = (req) => {
	if ('error' in req.query)
		return errorHandlingMessage[req.query.error] ? errorHandlingMessage[req.query.error] : "Erreur inconnue: " + req.query.error;
	return null;
};

const deleteAlbum = async (req, res) => {
	const albumId = req.params.id;
	await Album.findByIdAndDelete(albumId);

	albumPath = path.join(__dirname, "../public/uploads/", albumId);
	rimraf.rimrafSync(albumPath);
	res.redirect('/albums');
}

const deleteImage = async (req, res) => {
	try {
		const albumId = req.params.id;
		const imageIndex = req.params.imageIndex;
		const album = await Album.findById(albumId);
		if (!album)
			throw '0';
		const image = album.images[imageIndex];
		if (!image)
			throw '5';
		album.images.splice(imageIndex, 1);
		await album.save();

		const imagePath = path.join(__dirname, `../public/uploads`, albumId, image);
		fs.unlinkSync(imagePath);
		res.redirect(`/albums/${albumId}`);
	} catch (err) {
		console.log('in function deleteImage:', err);
		res.redirect(`/albums/${req.params.id}?error=${err}`)
	}
};

const addImage = async (req, res) => {
	try {
		const albumId = req.params.id;
		const album = await Album.findById(albumId);
		if (!album)
			throw '2';
		if (!req?.files?.image)
			throw '3';

		const image = req.files.image;
		if (!mimeMatch(image.mimetype, 'image/*'))
			throw '4';

		const folderPath = path.join(__dirname, "../public/uploads/", albumId);
		const localPath = path.join(folderPath, image.name);

		fs.mkdirSync(folderPath, { recursive: true });
		await req.files.image.mv(localPath);
		album.images.push(image.name);
		await album.save();
		res.redirect(`/albums/${albumId}`);
	} catch (err) {
		console.log('in function addImage:', err);
		if (err === '3' || err === '4')
			res.redirect(`/albums/${req.params.id}?error=${err}`);
		else
			res.redirect(`/albums`);
	}
};

const album = async (req, res) => {
	try {
		const errorMsg = catchError(req);
		const album = await Album.findById(req.params.id);
		if (!album)
			throw '1';
		res.render('album', {
			title: album.title,
			album,
			errors: errorMsg
		});
	} catch (err) {
		console.log('in function album:', err);
		res.redirect(`/albums?error=${err}`);
	}
};

const albums = async (req, res) => {
	try {
		const errorMsg = catchError(req);
		const albums = await Album.find();
		res.render('albums', {
			title: 'Tout les albums',
			albums,
			errors: errorMsg
		});
	} catch (err) {
		console.log('in function albums:', err);
		res.redirect('/');
	}
};

const createAlbumForm = (req, res) => {
	const errorMsg = catchError(req);

	res.render('new-album', {
			title: 'Nouvel album',
			errors: errorMsg
	});
};

const createAlbum = async (req, res) => {
	try {
		if (!req.body.albumTitle)
			throw '0';
		await Album.create({
			title: req.body.albumTitle
		});
		res.redirect('/albums');
	} catch (err) {
		console.log('in function createAlbum:', err);
		res.redirect(`/albums/create?error=${err}`)
	}
};

module.exports = {
	createAlbumForm,
	createAlbum,
	albums,
	album,
	addImage,
	deleteImage,
	deleteAlbum
};