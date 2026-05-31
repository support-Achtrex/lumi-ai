async function test() {
  const vin = '1XP5DB9X71D528536';
  try {
    const response = await fetch(`https://api.vehicledatabases.com/vin-auction-html/${vin}`, {
      headers: { 'x-AuthKey': 'e9694f64e00e46348041989c0fab704a' }
    });
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Response starts with:", data.substring(0, 100));
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
