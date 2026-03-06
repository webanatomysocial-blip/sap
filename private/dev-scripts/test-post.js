const axios = require('axios');
axios.post('http://localhost:8000/api/posts', {
  title: "Test Blog", slug: "test-blog", excerpt: "Test", content: "Test content"
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response ? err.response.data : err.message));
