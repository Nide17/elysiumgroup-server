// connect to db
// {
//     "mongoURI": "mongodb://localhost:27017/elysiumdb",
// "mongoURI": "mongodb+srv://nide:jesus123@cluster0.jugcf.mongodb.net/elysiumdb?retryWrites=true&w=majority",
// }

const mongoose = require("mongoose");
const config = require('config');

// get the value
const db = config.get('mongoURI');

// CONNECT TO MONGODB
// give us a promise
const connectDB = async () => {

    try {

        await mongoose.connect(db, {
            useNewUrlParser: true, useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('MongoDB Connected')

    } catch (err) {
        console.log(err.message);
        // Exit the process with failure
        process.exit(1);
    }
}

module.exports = connectDB;