const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    useUnifiedTopology: true
  });
  
  mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('ERROR WHEN CONNECTING: ', err);
  }); 
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}