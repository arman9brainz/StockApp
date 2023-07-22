
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  instrument_token: {
    type: String,
    required: true
  },
  exchange_token: {
    type: String,
    required: true
  },
  tradingsymbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  last_price: {
    type: String,
    required: true
  },
  expiry: {
    type: Date,
    required: true
  },
  strike: {
    type: String,
    required: true
  },
  tick_size: {
    type: String,
    required: true
  },
  lot_size: {
    type: Number,
    required: true
  },
  instrument_type: {
    type: String,
    required: true
  },
  segment: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
