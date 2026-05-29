const axios = require('axios');

async function runTest() {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post('https://lumi-ai-production.up.railway.app/api/auth/login', {
      email: 'demo@achtrex.com',
      password: 'password'
    });
    
    console.log('✅ Login successful:', response.data);
    
    // Now let's try a chat query
    const token = response.data.data.token;
    console.log('Testing chat endpoint...');
    
    const chatResponse = await axios.post(
      'https://lumi-ai-production.up.railway.app/api/chat/message',
      { message: "Hello! What is the estimated repair cost for a 2018 Honda Accord with P0420?" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Chat successful:', chatResponse.data);

  } catch (err) {
    if (err.response) {
      console.error('❌ Request failed with status', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

runTest();
