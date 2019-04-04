const express = require("express");
const app = express();
const db = require("./db.js");
var userController = require("./user/userController");
var authController = require("./auth/authController");
var port = process.env.PORT || 3000;


app.use("/users", userController);
app.use("/api/auth", authController);

app.listen(port , process.env.IP, function() {
    console.log(`server listening on port: ${port}`);
});