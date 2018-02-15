// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.requestChanged = functions.database.ref('/requests/{tuteeID}').onWrite(event => 
{
    //firebase.database().ref('/tutors/' + assignedTutorID + "/available").set(false).then(function() {
    var reqVals = event.data.val();
    if(reqVals.status == "unconfirmed") {
        console.log("NEW REQUEST");
        return admin.database().ref('/tutors/' + reqVals.tutorID + "/available").set(false).then(function() {
            console.log("Set unavailable.");
            return admin.database().ref('/users/' + reqVals.tutorID).once('value')
            .then(function(tutor) {
                console.log("Got tutor info.");
                if(tutor.val().messagingToken) {
                    console.log("Sending message...");
                    return sendUpdate(tutor.val().messagingToken, "New Request!", "You have been requested by " + reqVals.tuteeName + ".", "tutor_console");
                }
            });
        });
        
    }

    else if(reqVals.status == "confirmed") {
        console.log("CONFIRMED");
        return admin.database().ref('/users/' + event.params.tuteeID).once('value')
        .then(function(tutee) {
            if(tutee.val().messagingToken) {
                return sendUpdate(tutee.val().messagingToken, "Request Confirmed!", reqVals.tutorName + " has confirmed your request.", "current_request");
            }
        });
    }

    else if(reqVals.status == "completed") {
        console.log("COMPLETED");
        return admin.database().ref('/users/' + event.params.tuteeID).once('value')
        .then(function(tutee) {
            if(tutee.val().messagingToken) {
                return sendUpdate(tutee.val().messagingToken, "Request Completed!", reqVals.tutorName + " has marked your request as completed.", "current_request");
            }
        });
    }

    else if(reqVals.status == "timedout") {
        console.log("TIMED OUT");
        return admin.database().ref('/users/' + event.params.tuteeID).once('value')
        .then(function(tutee) {
            if(tutee.val().messagingToken) {
                return sendUpdate(tutee.val().messagingToken, "Request Timed Out :(", "Your assigned tutor did not confirm your request.", "request")
                .then(function() {
                    return admin.database().ref('/users/' + reqVals.tutorID).once('value')
                    .then(function(tutor) {
                        if(tutor.val().messagingToken) {
                            return sendUpdate(tutor.val().messagingToken, "Request Timed Out :(", "You failed to confirm " + reqVals.tuteeName + "'s request.", "tutor_console");
                        }
                    });
                });
            }
        });
    }
});

function sendUpdate(token, title, body, page) {
    var payload = {notification: {}};
    payload.notification.title = title;
    payload.notification.body = body;
    if(page) {
        payload.notification.clickAction = "https://tutoring.dtechhs.org/" + page + "/";
    }

    var options = {
        timeToLive: 60
    }

    return admin.messaging().sendToDevice(token, payload, options);
}