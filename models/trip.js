const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true
  },
  logEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogEntry'
  }],
  type: {
    type: String,
    enum: ['Business', 'Vacation', 'Adventure', 'Family', 'Other'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);

