var express = require('express');
var router = express.Router();
var database = require("../bin/database/database");
var jwtUtils = require("../bin/utils/jwtUtils");
/* GET users listing. */

router.post('/auth', function(req, res, next) {
    console.log(req.body);
    database.checkUser(req.body.userName, req.body.password).then(function (user) {
        console.log(user)
        if(user){
            var token = jwtUtils.createToken({userName: user.userName}, "2 days");
            console.log(token)
            res.header("Access-Control-Allow-Origin", "*");
            res.send({jwtToken: token, userName: user.userName});
        }else {
            res.status(401);
            res.send({error: "error"});
        }
    })

});

router.post('/logOut', function(req, res, next) {
    res.render("index");
});

module.exports = router;
