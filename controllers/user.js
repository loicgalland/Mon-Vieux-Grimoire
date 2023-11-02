const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signup = ((req, res, next) =>{
    // Cryptage du password
    bcrypt.hash(req.body.password, 10)
        .then(hash =>{
            // Création d'un nouveau user
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Enregistrement de ce nouveau user
            user.save()
                .then(() => res.status(201).json({message:"Utilisateur Créé !"}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
});

exports.login = (req, res, next) => {
    // Recherche du user dans la BD
    User.findOne({ email: req.body.email })
        .then(user => {
            // Si il n'existe pas -> error
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            // Comparaison des password de la bd et de la requête
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        // Si paire email / password correcte -> renvois du token et du userId
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            SECRET_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};