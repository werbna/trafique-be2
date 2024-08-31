const mongoose = require('mongoose');

const tripSchema = new Schema({
  destination: {
    type: String,
    required: true
  },
  logEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogEntry'
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);

