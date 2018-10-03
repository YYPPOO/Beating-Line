
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Firebase
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp(functions.config().firebase);

const db = admin.database();
// const nodemailer = require('nodemailer');

// Express
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// app.use(express.static('public'));

app.use("/exe/", (req, res, next) => {
	res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
	res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	res.set("Access-Control-Allow-Credentials", "true");
	next();
});

//＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝get Account 得到帳號
app.get("/exe/getAccount", (req, res) => {
	let userId = req.query.id
	console.log(userId)
	if (userId === null) {
		return res.json({
			error: 'No Data'
		})
	} else {
		db.ref("/userData/" + userId).once('value', (snapshot) => {
			if (snapshot.exists()) {
				let data = snapshot.val()
				delete data.createTime;
				delete data.updateTime;
				return res.json(data)
			} else {
				return res.json({
					error: 'No User'
				})
			}

		})
	}

})



//＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝New & Update Account
app.post("/exe/manageAccount", (req, res) => {
	let userData = req.body;
	let now = new Date();
	if (!userData.userName || !userData.userEmail || !userData.userId) {
		res.send({
			error: "Create Order Error: Wrong Data Format"
		});
		return;
	}
	let userId = userData.userId

	let memberData = {
		userName: userData.userName,
		userEmail: userData.userEmail,
		providerId: userData.providerId,
		createTime: now.getTime(),
		updateTime: now.getTime()
	};

	db.ref("/userData/" + userId).once('value', (snapshot) => {

		if (snapshot.exists()) {
			let getData = snapshot.val();
			Object.keys(userData).map(getdata => {
				console.log(getdata)
			})

			if (userData.userName !== null) {
				getData.userName = userData.userName;
			}

			getData.updateTime = now.getTime();
			db.ref("/userData/" + userId).update(getData, (error) => {
				res.send({
					userId: userId
				});
			});

		} else {
			db.ref("/userData/" + userId).set(memberData, (error) => {
				if (error) {
					res.send({
						error: "Create Account Error"
					});
				} else {
					res.send({
						success: "Create Account"
					});
				}
			})
		}
	})
})

app.post("/exe/saveBeat", (req, res) => {
	let beatData = req.body;
	let now = new Date();
	if (!beatData.name) {
		res.send({
			error: "Save Beat Error: No Beat Name."
		});
		return;
	}
	let beatId = beatData.beatId;
	let newBeat = {
		author:beatId,
		beat:beatData.state,
		beatName:beatData.beatName,
		bpm:beatData.bpm,
		length:beatData.length,
		volume:beatData.volume
	}

	db.ref("/beatData/"+beatId).once("value", (snapshot) => {
		if(snapshot.exists()) {
			let originBeat = snapshot.val();
			console.log(originBeat);

			if(originBeat.auther === beatData.user) {
				originBeat.beat = state;
				originBeat.beatName = beatName;
				originBeat.bpm = bpm;
				originBeat.length = length;
				originBeat.volume = volume;

				db.ref("/beatData/"+beatId).update(originBeat, (error) => {
					if (error) {
						res.send({
							error: "Save Beat Error."
						});
					} else {
						res.send({
							success: "Update beat success!",
							beatId: beatId
						});
					}
				});
			} else {
				let key = db.ref("/beatData/").push().key;
				db.ref("/beatData/"+key).set(newBeat, (error) => {
					if (error) {
						res.send({
							error: "Save Beat Error."
						});
					} else {
						res.send({
							success: "Saved as a new beat.",
							newBeatId: key
						});
					}
				});
			}

		} else {
			let key = db.ref("/beatData/").push().key;
			db.ref("/beatData/"+key).set(newBeat, (error) => {
				if (error) {
					res.send({
						error: "Save Beat Error."
					});
				} else {
					res.send({
						success: "Saved as a new beat.",
						newBeatId: key
					});
				}
			});
		}
	})
})

// app.listen(3000, () => console.log('Listening on port 3000!'))

exports.app = functions.https.onRequest(app);