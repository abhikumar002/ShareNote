const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import the CORS package
const port = 5000;
const app = express();
app.use(express.json());

// Allow CORS for frontend running on port 3000
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'], // Allow Content-Type header
}));

const server = http.createServer(app);
const io = socketIo(server);

var admin = require("firebase-admin");

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let textStorage = {};
const db = admin.firestore();

// API to save text
app.post('/api/saveText', async (req, res) => {
    const { token, text } = req.body;

    // Validate input
    if (!token || !text) {
      return res.status(400).json({ success: false, message: 'Token and text are required' });
    }

    try {
      // Store the text in Firestore under the "texts" collection using the token as the document ID
      const docRef = db.collection('texts').doc(token);
      await docRef.set({ text });

      // Respond with success
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving text: ', error);
      res.status(500).json({ success: false, message: 'Failed to save text' });
    }
});

// API to fetch text
// app.get('/fetch', async (req, res) => {
//     const token = req.query.token;

//     try {
//       // Fetch the text from Firestore using the token as the document ID
//       const docRef = db.collection('texts').doc(token);
//       const doc = await docRef.get();

//       if (!doc.exists) {
//         return res.status(404).json({ success: false, message: 'Text not found' });
//       }

//       // Respond with the fetched text
//       res.json({ success: true, text: doc.data().text });
      
//     } catch (error) {
//       console.error('Error fetching text: ', error);
//       res.status(500).json({ success: false, message: 'Failed to fetch text' });
//     }
// });


app.get('/fetch', async (req, res) => {
    const token = req.query.token;

    try {
      // Fetch the text from Firestore using the token as the document ID
      const docRef = db.collection('texts').doc(token);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).send(`
          <html>
            <body>
              <h1>Text not found</h1>
              <p>The requested text was not found in the database.</p>
            </body>
          </html>
        `);
      }

      // Respond with an HTML page containing the fetched text
      const text = doc.data().text;
      res.send(`
        <html>
          <head>
            <title>Fetched Text</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .content { margin-top: 20px; padding: 10px; background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>Fetched Text</h1>
            <div class="content">
              <p>${text}</p>
            </div>
          </body>
        </html>
      `);
      
    } catch (error) {
      console.error('Error fetching text: ', error);
      res.status(500).send(`
        <html>
          <body>
            <h1>Failed to Fetch Text</h1>
            <p>Sorry, there was an error retrieving the text.</p>
          </body>
        </html>
      `);
    }
});


// WebSocket connection
io.on('connection', (socket) => {
  socket.on('update-text', ({ token, text }) => {
    textStorage[token] = text; // Update text in memory
    io.emit('receive-text', { token, text }); // Broadcast update to all clients
  });
});

server.listen(port, () => {
  console.log('Server is running on port 5000');
});
