const functions = require('firebase-functions');
const admin = require('firebase-admin')
const firebase = require('firebase')
const app = require('express')()
var firebaseConfig = require('./firebaseConfig')

admin.initializeApp()

 
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = admin.firestore()

app.get('/screams', (req, res) => {
  db
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

  db
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

 const isEmail = (email) => {
   const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   
   if(email.match(regEx)){ 
     return true
  } else {
    return false;
  }
}

 const isEmpty = (string) => {
   if(string.trim() === '' ) return true;
   else return false;
 }

// Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  let errors = {}

  if(isEmpty(newUser.email)){
    errors.email = 'Email must not be empty'
  } else if(!isEmail(newUser.email)){
           errors.email = 'Must be a valid email adress'

  }

  if(isEmpty(newUser.password)) errors.password = 'Must not be empty'
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match'
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty'

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  // TODO validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
  .get()
  .then(doc => {
    if(doc.exists){
      return res.status(400).json({ handle: 'this handle is already taken' })
    } else {
     return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
    }
  })
  .then(data => {
    userId = data.user.uid
    return data.user.getIdToken()
  })
  .then(idToken => {
    token = idToken;
    const userCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId
    }
    return db.doc(`/users/${newUser.handle}`).set(userCredentials)
  
  })
  .then(() => {
    return res.status(201).json({ token })
  })
  .catch(err => {
    console.error(err)
    if(err.code === 'auth/email-already-in-use'){
      return res.status(400).json({ email: 'Email is already in use' })
    } else {
      return res.status(500).json({ error: err.code })
    }
  })

 
})


exports.api = functions.region('us-central1').https.onRequest(app)
