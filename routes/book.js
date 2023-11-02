const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book')
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');


//Appel des différentes routes  (CRUD)
router.post('/', auth, multer, bookCtrl.createBook);

router.get('/',bookCtrl.getAllBooks);

router.get('/bestrating', bookCtrl.bestRating);

router.get('/:id', bookCtrl.getOneBook);

router.put('/:id', auth, multer, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteOneBook);

router.post('/:id/rating', auth, bookCtrl.addRating);



module.exports = router;