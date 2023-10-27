const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => { res.status(201).json({message: 'Livre ajouté !'}) })
        .catch(error => { res.status(400).json({ error}) })
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then(book => {
            if(book.userId != req.auth.userId){
                res.status(400).json({ message : 'Non-autorisé !' });
            } else {
                Book.updateOne({_id: req.params.id}, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Livre modifié avec succès !" }))
                    .catch(error => res.status(401).json({error}));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        })
};

exports.deleteOneBook = (req, res, next) => {
   Book.findOne({_id: req.params.id})
       .then(book =>{
            if(book.userId != req.auth.userId){
                res.status(401).json({ message : 'Non-autorisé !' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
                        .catch(error => res.status(401).json({error}));
                })
            }
       })
       .catch(error => {
           res.status(500).json({ error })
       });
};

exports.addRating = (req, res, next) => {
    //récupération de la note et du userId
    const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
    };
    //Ajout de la nouvelle note au livre
    Book.findByIdAndUpdate({_id: req.params.id})
        .then(book =>{
            //Vérification si user a déjà noté le livre
            const existingRating = book.ratings.find(
                rating => rating.userId === req.auth.userId
            )
            if(existingRating){
                return res.status(403).json({message: "Vous avez déjà noté ce livre"})
            }
            book.ratings.push(rating);
            //Calcul de la somme des notes
            let totalRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
            //Calcul de la moyenne des notes
            book.averageRating = totalRating / book.ratings.length;
            //Enregistrement du livre avec la nouvelle note
            book.save()
                .then((book) => { res.status(201).json(book) })
                .catch(error => res.status(400).json({ error }))
        })

};

exports.bestRating = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then(book => res.status(201).json(book))
        .catch(error => res.status(401).json({error}))

};