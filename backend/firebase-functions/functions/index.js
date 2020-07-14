const functions = require('firebase-functions');
const firebase = require('firebase')
const app = require('express')()
var firebaseConfig = require('./firebaseConfig')
const { getAllScreams, postOneScream } = require('./handlers/screams')
const { signup, login } = require('./handlers/users') 
// Initialize Firebase
firebase.initializeApp(firebaseConfig.firebaseConfig);


// scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBAuth, postOneScream)

//users routes
app.post('/signup', signup )
app.post('/login', login)


const FBAuth = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
     idToken = req.headers.authorization.split('Bearer ')[1]    
  } else {
    console.error('No token found')
    return res.status(403).json({ error: 'Unauthorized' })
  }
  admin.auth().verifyIdToken(idToken)
  .then(decodedToken => {
    req.user = decodedToken;
    return db.collection('screams')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get()
  })
   .then(data => {
     req.user.handle = data.docs[0].data().handle;
     return next();
   })
   .catch(err => {
     console.error('Error while verifying token', err)
     return res.status(403).json(err)
   })
}
 

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

 

exports.api = functions.region('us-central1').https.onRequest(app)
