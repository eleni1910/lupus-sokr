const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use(cors());
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api/patients', require('./routes/patients'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/follow-ups', require('./routes/followUps'));
app.use('/api/alerts', require('./routes/alerts'));

app.get('/', (req, res) => {
    res.send('Welcome to the Lupus Sokr API!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
