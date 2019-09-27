var admin = require('firebase-admin');
var keys = require('../config/keys').keys.firebase;
var databaseURL = require('../config/keys').keys.databaseURL;



// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(keys),
    databaseURL: databaseURL,
    databaseAuthVariableOverride: {
        uid: "fb-server-admin"
    }
});

module.exports = {
    db: admin.database()
}
