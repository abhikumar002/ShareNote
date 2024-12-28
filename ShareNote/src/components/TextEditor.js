import React, { useState, useEffect } from 'react';
import { saveTextToServer } from '../utils/IndexedDB';
import { socket } from '../utils/socket';

const TextEditor = ({ token }) => {
  const [text, setText] = useState('');

  // Update the text in the database and broadcast to other clients
  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    saveTextToServer(token, newText);  // Save locally
    socket.emit('update-text', { token, text: newText }); // Broadcast update
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Write something..."
        rows="10"
        cols="50"
      />
    </div>
  );
};

export default TextEditor;
