const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Use the cors middleware

mongoose.connect('mongodb+srv://abdulsamea2003:PM123@cluster0.29zqtlv.mongodb.net/Bank', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

const certificatesRouter = require('./routes/certificates');
const installmentsRouter = require('./routes/installments');

app.use(certificatesRouter);
app.use(installmentsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
