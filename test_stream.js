const axios = require('axios');
const http = require('http');

async function test() {
  try {
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'demo@achtrex.com',
      password: 'test'
    });
    
    const token = loginRes.data.data.token;
    console.log('Login successful! Token acquired.');
    
    console.log('2. Testing Chat Stream...');
    const req = http.request('http://localhost:3001/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`CHUNK: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(JSON.stringify({ message: 'Hello, what is your name?' }));
    req.end();

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
