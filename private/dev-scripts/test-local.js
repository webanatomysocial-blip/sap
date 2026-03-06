const http = require('http');
http.get('http://localhost:5173/api/posts', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Posts status:', res.statusCode, data.substring(0, 100)));
});
http.get('http://localhost:5173/api/get_homepage_data.php', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Homepage status:', res.statusCode, data.substring(0, 100)));
});
