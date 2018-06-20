/**
 * Created by martin on 4.2.17.
 */
var jwt    = require('jsonwebtoken');
var secret = process.env.JWT_SECRET_KEY;
function Tokens() {
    
}
Tokens.createToken = function (data, expTime) {
     var token = jwt.sign(data, secret, {
        expiresIn: expTime // expires in 24 hours
    });
     return token;
}


module.exports = Tokens;