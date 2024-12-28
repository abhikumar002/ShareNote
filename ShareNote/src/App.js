import React, { useState } from 'react';
import './App.css';
import { saveTextToServer } from './utils/IndexedDB'; // Import the saveText function

// Function to generate a random token
function generateRandomToken(length = 4) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }
  return token;
}

function App() {
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [shareLink, setShareLink] = useState('');

  const baseurl = 'http://localhost:5000/fetch?token=';

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleShareText = () => {
    const generatedToken = generateRandomToken();
    const fullShareLink = baseurl + generatedToken;
    setToken(generatedToken); // Update the token state
    setShareLink(fullShareLink);

    // Save text and token to IndexedDB
    saveTextToServer(generatedToken, text);

    alert(`Text shared! Your shareable link: ${fullShareLink}`);
  };

  return (
    <div className="App">
      <h1>Welcome to Text-Share</h1>

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Type some text here..."
        rows="15"
        cols="125"
      ></textarea>

      <div>
      <button onClick={handleShareText}>Share Text</button>
      </div>

      {shareLink && (
        <div>
          <h3>Share this link with others:</h3>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}
    </div>
  );
}

export default App;
