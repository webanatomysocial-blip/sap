const axios = require('axios');
axios.get('http://localhost:5173/api/get_homepage_data.php')
  .then(res => console.log("Success:", res.data))
  .catch(err => console.error("Error:", err.message, err.response ? err.response.data : ''));
