import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const serviceAccount = require('./serviceAccountKey.json');

import * as express from 'express';
import * as cors from 'cors';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-angular-67430.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    response.json({ mensaje: "Hola mundo desde Firebase Fn!!! :D" });
});

//async es para hacer todo secunencial
export const getGOTY = functions.https.onRequest(async (request, response) => {

    // const nombre = request.query.nombre ? request.query.nombre:'sfc';
    const gotyREf = db.collection('goty');
    // Es toda la DB
    const docsSnapShot = await gotyREf.get();
    const juegos = docsSnapShot.docs.map(doc => doc.data());

    // response.json(docsSnapShot.docs[0].data());

    response.json(juegos);
});


// SERVIDOR EXPRESS DE NODE.JS

const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
    const gotyREf = db.collection('goty');
    const docsSnapshot = await gotyREf.get();
    const juegos = docsSnapshot.docs.map(doc => doc.data());
    res.json(juegos);
});
app.post('/goty/:id', async (req, res) => {
    const id = req.params.id;
    const gameRef = db.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
        res.status(404).json(
            {
                ok: "false",
                mensaje: `no existe juego con id : ${id}`
            }
        )
    } else {

        const oldData =  gameSnap.data() || { votos: 0}
        //espera la rta
        await gameRef.update({
            votos: oldData.votos + 1
        })

        res.json({
            ok: true,
            mensaje: `gracias por tu voto a ${oldData.nombre}`
        });
    }

});

//decirle a firebase que tiene express
//exports.api
export const api = functions.https.onRequest(app);


