// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
//Name Triggers testData 
exports.testData = functions.database.ref('/data/{pushId}').onWrite(event => 
{
  // Grab the current value of what was written to the Realtime Database.
  const original = event.data.val();

});