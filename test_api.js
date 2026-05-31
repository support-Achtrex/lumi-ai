const axios = require('axios');

async function test() {
  try {
    console.log("Trying with Header...");
    const res = await axios.get('https://automotivedataset.com/api/vin/full-report?vin=1FTFW1ET5EKE00001', {
      headers: { 'X-API-Key': '0e2ac789d2a5884514693f6327426ad714fcc7bc' },
      timeout: 5000
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.log("Failed with Header:", e.message);
    try {
      console.log("Trying with Query Param...");
      const res2 = await axios.get('https://automotivedataset.com/api/vin/full-report?vin=1FTFW1ET5EKE00001&key=0e2ac789d2a5884514693f6327426ad714fcc7bc', { timeout: 5000 });
      console.log(JSON.stringify(res2.data, null, 2));
    } catch(err2) {
      console.log("Failed with Query:", err2.message);
      if (err2.response) console.log(err2.response.data);
    }
  }
}
test();
