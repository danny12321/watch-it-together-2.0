const express = require('express');
const app = express();


app.listen(5000, err => {
  if (err) throw err
  console.log('server is listening')
})