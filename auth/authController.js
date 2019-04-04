const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../user/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const verifyToken = require("./verifyToken");


router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// auth routes

// user registration
router.post("/register", function(req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    };
    User.create(newUser, function(err, user) {
        if(err) {
            return res.status(500).send("There was a problem registering the user.");
        }
        var token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400});
        res.status(200).send({auth: true, token: token});
    });
});

// user login
router.post("/login", verifyToken, function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
        if(err) {
            return res.status(500).send("There was a problem logging in the user.")
        }

        if(!user) {
            return res.status(404).send("User not found.");
        }
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid) {
            return res.status(401).send({auth: false, token: null});
        }
        var token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400});
        res.status(200).send({auth: true, token: token});
    });
});

// user logout
router.get("/logout", verifyToken, function(req, res) {
    res.status(200).send({auth: false, token: null});
});

module.exports = router;