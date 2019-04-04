var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var User = require("./user");
var verifyToken = require("../auth/verifyToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// user CRUD routes

// user create
router.post('/create', function (req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    };
    User.create(newUser, function(err, user) {
        if(err) {
            return res.status(500).send("There was a problem creating user.");
        }
        var token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400});
        res.status(200).send({
            auth: true,
            token: token,
            _id: user._id,
            name: user.name,
            email: user.email
        });
    });
});

// user index
router.get('/index', verifyToken, function (req, res) {
    User.find({}, {password: 0}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// user detail
router.get('/:id', verifyToken, function (req, res) {
    User.findById(req.params.id, {password: 0}, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// user delete
router.delete('/:id', verifyToken, function (req, res) {
    User.findByIdAndRemove(req.params.id, {password: 0}, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send(`The user ${user.name} was deleted.`);
    });
});

// user edit
router.put('/:id', verifyToken, function (req, res) {
    User.findByIdAndUpdate(req.params.id, {password: 0}, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
});

module.exports = router;