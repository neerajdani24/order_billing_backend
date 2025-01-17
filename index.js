const express = require('express');
const cors = require('cors'); // Importing CORS package
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mysql = require('mysql2');
const Order = require('./models/order'); // MongoDB model

const app = express(); // Initialize the app here

// Middleware to allow CORS (Cross-Origin Resource Sharing)
app.use(cors()); // Enable CORS for all requests

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/orderBilling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MySQL connection
const sqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Your MySQL username
  password: 'Sql@1234',  // Your MySQL password
  database: 'order_billing', // Your MySQL database
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const data = req.body;

  // Auto-generate fullName and tracking number
  data.fullName = `${data.firstName} ${data.lastName}`;
  data.tracking = `TRACK-${Date.now()}`;

  try {
    // Save to MongoDB
    const mongoOrder = new Order(data);
    await mongoOrder.save();

    // Save to MySQL
    sqlConnection.query(
      'INSERT INTO orders (email, first_name, last_name, full_name, status, tracking, address, address2, city, state, zip, county) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.email,
        data.firstName,
        data.lastName,
        data.fullName,
        data.status,
        data.tracking,
        data.address,
        data.address2,
        data.city,
        data.state,
        data.zip,
        data.county,
      ],
      (error, results) => {
        if (error) {
          console.error('Error inserting data into MySQL:', error);
          return res.status(500).send({ error: 'Error saving to MySQL' });
        }
        // Send success response
        res.status(200).send({ message: 'Order submitted successfully!' });
      }
    );
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).send({ error: 'Error saving the order' });
  }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
