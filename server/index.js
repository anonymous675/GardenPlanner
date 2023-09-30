// server/index.js

const express = require("express");
const path = require('path');
const PORT = process.env.PORT || 3001;

const app = express();

// app.use(express.static(path.join(__dirname, '../client/build')));


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});