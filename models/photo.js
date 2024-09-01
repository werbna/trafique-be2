const mongoose = require('mongoose');


const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  logEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogEntry',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Photo', photoSchema);
