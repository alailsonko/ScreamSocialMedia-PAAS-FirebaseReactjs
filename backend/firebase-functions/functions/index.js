const functions = require('firebase-functions');
const admin = require('firebase-admin')
const firebase = require('firebase')
const app = require('express')()
 

admin.initializeApp()

var firebaseConfig = {
  apiKey: "AIzaSyAcTWzC7__R3t2rtoifcqN4fDBz-z5VFDI",
  authDomain: "mansion-4fa4a.firebaseapp.com",
  databaseURL: "https://mansion-4fa4a.firebaseio.com",
  projectId: "mansion-4fa4a",
  storageBucket: "mansion-4fa4a.appspot.com",
  messagingSenderId: "396090854471",
  appId: "1:396090854471:web:d2a51eff6313f0e5fd3562",
  measurementId: "G-XHBMDZGRT7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req, res) => {
  admin
  .firestore()
  .collection('screams')
  .orderBy('createdAt', 'desc')
  .get()
  .then(data => {
    let screams = []
    data.forEach(doc => {
      screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt: doc.data().createdAt,
        commentCount: doc.data().commentCount,
        likeCount: doc.data().likeCount
      })
    })
    return res.json(screams)
  })
  .catch((err) => console.error(err))
})

 

 app.post('/scream', (req, res) => {
  const newScream = {
    
    "body": req.body.body,
    "userHandle": req.body.userHandle,
    "createdAt": new Date().toISOString()
  }

  admin.firestore()
  .collection('screams')
  .add(newScream)
  .then((doc) => {
   return res.json({"message": `document ${doc.id} created successfully`})
  })
  .catch(err => {
    res.status(500).json({ "error": "something went wrong" })
    console.error(err)
  })
 })


// Signup route
app.post('/signup')


exports.api = functions.region('us-central1').https.onRequest(app)
