// Bring in all dependencies
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
// const config = require('config')
const connectDB = require('./config/db');
const cors = require('cors')

const app = express();

// Init Middleware - deprecated body parser
app.use(cors({origin: '*'}))
app.use(express.json({ extended: false }))

// Connect DB
connectDB();

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/contacts', require('./routes/api/contacts'));
app.use('/api/clients', require('./routes/api/clients'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/services', require('./routes/api/services'));

//Edit for deployment || serve static assets if in production
if (process.env.NODE_ENV === 'production') {

    //Set a static folder for frontend build
    app.use(express.static('client/build'));

    //anything coming will be redirected here
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
    //Let's create a post build script in package.json
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT} 🔥`));