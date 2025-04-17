// Add this code to your existing main server
// You can create a new file called keep-alive.js and require it in your main app

const axios = require('axios');

// Your dummy server URL (update this with your actual dummy server URL after deployment)
const DUMMY_SERVER_URL = 'https://your-dummy-server.onrender.com/ping';

// Function to ping the dummy server
async function pingDummyServer() {
  try {
    console.log(`Pinging dummy server at: ${new Date().toISOString()}`);
    const response = await axios.get(DUMMY_SERVER_URL);
    console.log('Dummy server response:', response.data);
    return true;
  } catch (error) {
    console.error('Error pinging dummy server:', error.message);
    return false;
  }
}

// If you're using Express.js, integrate this into your token-checker route
// Example:
/*
app.get('/token-checker', async (req, res) => {
  // Your existing token checking logic here
  
  // After processing the request, ping the dummy server
  pingDummyServer().catch(err => console.error('Failed to ping dummy server:', err));
  
  // Return your normal response
  res.send({ status: 'ok', message: 'Token checked' });
});
*/

module.exports = { pingDummyServer };
