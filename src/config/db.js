const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb://localhost:27017');

let db;

async function connectDb() {
    try {
        await mongoClient.connect();
        console.log('MongoDB connected');
        db = mongoClient.db('local');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
}

function getDb() {
    return db;
}

module.exports = { connectDb, getDb };