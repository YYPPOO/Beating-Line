const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', {structuredData: true});
//   response.send('Hello from Firebase!');
// });

const db = admin.database();
// const nodemailer = require('nodemailer');

// Express
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
// app.use(express.static('public'));

app.use('/exe/', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.set('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

// get Account ---------------------------------------------------
app.get('/exe/getAccount', (req, res) => {
  const userId = req.query.id;
  console.log(userId);
  if (userId === null) {
    return res.json({
      error: 'No Data',
    });
  } else {
    db.ref('/userData/' + userId).once('value', snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        delete data.createTime;
        delete data.updateTime;
        return res.json(data);
      } else {
        return res.json({
          error: 'No User',
        });
      }
    });
  }
});

// New & Update Account
app.post('/exe/manageAccount', (req, res) => {
  const userData = req.body;
  const now = new Date();
  if (!userData.userName || !userData.userEmail || !userData.userId) {
    res.send({
      error: 'Create Order Error: Wrong Data Format',
    });
    return;
  }
  const userId = userData.userId;

  const memberData = {
    userName: userData.userName,
    userEmail: userData.userEmail,
    providerId: userData.providerId,
    createTime: now.getTime(),
    updateTime: now.getTime(),
  };

  db.ref('/userData/' + userId).once('value', snapshot => {
    if (snapshot.exists()) {
      const getData = snapshot.val();
      Object.keys(userData).map(key => console.log(key));

      if (userData.userName !== null) {
        getData.userName = userData.userName;
      }

      getData.updateTime = now.getTime();
      db.ref('/userData/' + userId).update(getData, () => {
        res.send({
          userId: userId,
        });
      });
    } else {
      db.ref('/userData/' + userId).set(memberData, error => {
        if (error) {
          res.send({
            error: 'Create Account Error',
          });
        } else {
          res.send({
            success: 'Create Account',
          });
        }
      });
    }
  });
});

app.post('/exe/saveBeat', (req, res) => {
  const beatData = req.body;
  console.log(req.body);
  if (!beatData.beatName) {
    res.send({
      error: 'No Beat Name.',
    });
    return;
  }
  const beatId = beatData.beatId;
  const newBeat = {
    author: beatData.user,
    beat: beatData.beat,
    beatName: beatData.beatName,
    bpm: beatData.bpm,
    totalLength: beatData.totalLength,
    volume: beatData.volume,
  };

  if (beatId) {
    db.ref('/beatData/' + beatId).once('value', snapshot => {
      const originBeat = snapshot.val();
      console.log(originBeat);
      if (originBeat && originBeat.author === newBeat.author) {
        db.ref('/beatData/' + beatId).update(newBeat, error => {
          if (error) {
            res.status(400).send({
              error: 'Save Beat Error.',
            });
          } else {
            res.send({
              success: 'Update beat success!',
              newBeatId: beatId,
            });
          }
        });
      } else {
        const key = db.ref('/beatData/').push().key;
        db.ref('/beatData/' + key).set(newBeat, error => {
          if (error) {
            res.status(400).send({
              error: 'Save Beat Error.',
            });
          } else {
            db.ref('/userData/' + newBeat.author).once('value', snapshot => {
              let userBeats = {};
              userBeats = snapshot.val();
              if (!userBeats.beats) {
                userBeats.beats = {};
              }
              userBeats.beats[key] = newBeat.beatName;
              db.ref('/userData/' + newBeat.author).update(userBeats, error => {
                if (error) {
                  res.status(400).send({
                    error: 'Save User Beat Error.',
                  });
                } else {
                  res.send({
                    success: 'Saved as a new beat.',
                    newBeatId: key,
                    author: newBeat.author,
                  });
                }
              });
            });
          }
        });
      }
    });
  } else {
    const key = db.ref('/beatData/').push().key;
    console.log(key);
    console.log(newBeat);
    db.ref('/beatData/' + key).set(newBeat, error => {
      if (error) {
        res.status(400).send({
          error: 'Save Beat Error.',
        });
      } else {
        db.ref('/userData/' + newBeat.author).once('value', snapshot => {
          let userBeats = {};
          userBeats = snapshot.val();
          if (!userBeats.beats) {
            userBeats.beats = {};
          }
          console.log(userBeats);
          userBeats.beats[key] = newBeat.beatName;
          db.ref('/userData/' + newBeat.author).update(userBeats, error => {
            if (error) {
              res.status(400).send({
                error: 'Save User Beat Error.',
              });
            } else {
              res.send({
                success: 'Saved as a new beat.',
                newBeatId: key,
                author: newBeat.author,
              });
            }
          });
        });
      }
    });
  }
});

app.post('/exe/saveAsNewBeat', (req, res) => {
  const beatData = req.body;
  if (!beatData.beatName) {
    res.send({
      error: 'Save Beat Error: No Beat Name.',
    });
    return;
  }
  const newBeat = {
    author: beatData.user,
    beat: beatData.beat,
    beatName: beatData.beatName,
    bpm: beatData.bpm,
    totalLength: beatData.totalLength,
    volume: beatData.volume,
  };

  const key = db.ref('/beatData/').push().key;
  db.ref('/beatData/' + key).set(newBeat, error => {
    if (error) {
      res.status(400).send({
        error: 'Save Beat Error.',
      });
    } else {
      db.ref('/userData/' + newBeat.author).once('value', snapshot => {
        let userBeats = {};
        userBeats = snapshot.val();
        if (!userBeats.beats) {
          userBeats.beats = {};
        }
        userBeats.beats[key] = newBeat.beatName;
        db.ref('/userData/' + newBeat.author).update(userBeats, error => {
          if (error) {
            res.status(400).send({
              error: 'Save User Beat Error.',
            });
          } else {
            res.send({
              success: 'Saved as a new beat.',
              newBeatId: key,
              author: newBeat.author,
            });
          }
        });
      });
    }
  });
});

// get beat ------------------------------------------
app.get('/exe/getBeat', (req, res) => {
  const beatId = req.query.id;
  console.log(beatId);
  if (beatId === null) {
    return res.json({
      error: 'No Beat Id Data',
    });
  } else {
    db.ref('/beatData/' + beatId).once('value', snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        return res.json(data);
      } else {
        return res.json({
          error: 'No Beat Data',
        });
      }
    });
  }
});

// get user's beat list -----------------------------------------
app.get('/exe/getUserBeat', (req, res) => {
  const userId = req.query.userId;
  db.ref('/userData/' + userId + '/beats/').once('value', snapshot => {
    if (snapshot.exists()) {
      const userBeatList = snapshot.val();
      console.log(userBeatList);
      return res.json(userBeatList);
    } else {
      return res.json({
        error: 'No user data.',
      });
    }
  });
});

// delete beat --------------------------------------------------
app.delete('/exe/deleteBeat', (req, res) => {
  const beatId = req.query.beatId;
  const userId = req.query.userId;
  db.ref('/beatData/' + beatId).remove()
      .then(() => {
        return db.ref('/userData/' + userId + '/beats/' + beatId).remove();
      }).then(() => {
        return res.json({status: 'delete success'});
      }).catch(error => {
        return res.json({error: error});
      });
});

// app.listen(3000, () => console.log('Listening on port 3000!'))

exports.app = functions.https.onRequest(app);
