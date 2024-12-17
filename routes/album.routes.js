const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller');

router.get('/', albumController.albums);
router.get('/create', albumController.createAlbumForm);
router.post('/create', albumController.createAlbum);
router.get('/:id', albumController.album);
router.post('/:id', albumController.addImage);
router.get('/:id/delete/', albumController.deleteAlbum);
router.get('/:id/delete/:imageIndex', albumController.deleteImage);

module.exports = router;