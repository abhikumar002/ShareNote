import { openDB } from 'idb';

const dbPromise = openDB('text-share', 1, {
  upgrade(db) {
    db.createObjectStore('texts', { keyPath: 'token' });
  },
});

export const saveTextToServer = async (token, text) => {
    try {
      const response = await fetch('http://localhost:5000/api/saveText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, text }),
      });
  
      // Check if the response is not OK (not in the 2xx range)
      if (!response.ok) {
        console.error(`Server error: ${response.status}`);
        return;
      }
  
      // Attempt to parse JSON response
      const result = await response.json();
  
      if (result.success) {
        console.log('Text saved on server with token:', token);
      } else {
        console.error('Error saving text to server');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  

export const saveText = (token, text) => {
    const request = indexedDB.open('textShareDB', 1);
  
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('texts')) {
        const objectStore = db.createObjectStore('texts', { keyPath: 'token' });
        objectStore.createIndex('token', 'token', { unique: true });
      }
    };
  
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['texts'], 'readwrite');
      const objectStore = transaction.objectStore('texts');
      const data = {
        token: token,
        text: text,
      };
      const addRequest = objectStore.add(data);
  
      addRequest.onsuccess = () => {
        console.log('Text saved with token:', token);
      };
  
      addRequest.onerror = (error) => {
        console.error('Error saving text:', error);
      };
    };
  
    request.onerror = (error) => {
      console.error('Error opening IndexedDB:', error);
    };
};

export const getText = async (token) => {
  const db = await dbPromise;
  return await db.get('texts', token);
};
