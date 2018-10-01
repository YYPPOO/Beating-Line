// Firebase
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp(functions.config().firebase);

const db = admin.database();
const nodemailer = require('nodemailer');

// Express
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use("/exe/", function (req, res, next) {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
	res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	res.set("Access-Control-Allow-Credentials", "true");
	next();
});

app.use(express.static('public'));

app.get('/', (req, res) => res.send('Hello My Server!'))

app.get('/getData', function (req, res) {
    let i = req.query.number;
    console.log(i);
    if (i){
        let resault = 0;
        for(let j=0;j<=i;j++){
            resault += j;
        }
        res.send(resault.toString());
    }
    else {
        res.send("Wrong Parameters");
    };
});

app.listen(3000, () => console.log('Listening on port 3000!'))