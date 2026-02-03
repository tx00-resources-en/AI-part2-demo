const express = require('express');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const aiRoutes = require('./routes/aiRoutes');

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

// Use text routes
app.use('/api', aiRoutes);


const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



