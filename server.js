const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse incoming JSON requests

// MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sql@1234',
  database: 'orderBilling',
});

mysqlConnection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/orderBilling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB database!'))
  .catch((err) => console.log(err));

// MongoDB Schema
const orderSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  fullName: String,
  status: String,
  tracking: String,
  address: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  county: String,
});

const Order = mongoose.model('Order', orderSchema);

// POST request handler
app.post('/submit-form', (req, res) => {
  const orderData = req.body;

  // Insert into MongoDB
  const newOrder = new Order(orderData);
  newOrder.save((err, savedOrder) => {
    if (err) {
      console.log('Error saving to MongoDB:', err);
      return res.status(500).json({ message: 'Error saving to MongoDB' });
    }

    // Insert into MySQL
    const query = 'INSERT INTO orders SET ?';
    mysqlConnection.query(query, orderData, (err, results) => {
      if (err) {
        console.log('Error saving to MySQL:', err);
        return res.status(500).json({ message: 'Error saving to MySQL' });
      }

      return res.status(200).json({
        message: 'Form data submitted successfully!',
        orderId: savedOrder._id,
      });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
