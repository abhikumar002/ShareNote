import React, { useState, useEffect } from 'react';
import { getText } from '../utils/IndexedDB';
import { socket } from '../utils/socket';

const TextViewer = ({ token }) => {
  const [text, setText] = useState('');

  // Fetch initial text from IndexedDB
  useEffect(() => {
    const fetchText = async () => {
      const savedText = await getText(token);
      if (savedText) {
        setText(savedText);
      }
    };
    fetchText();
  }, [token]);

  // Listen for real-time updates
  useEffect(() => {
    socket.on('receive-text', (data) => {
      if (data.token === token) {
        setText(data.text);
      }
    });
  }, [token]);

  return <div>{text}</div>;
};

export default TextViewer;
