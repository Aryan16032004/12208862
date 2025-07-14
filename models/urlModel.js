import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  timestamp: Date,
  referrer: String,
  geo: String, 
});

const urlSchema = new mongoose.Schema({
  shortcode: { type: String, unique: true },
  originalUrl: String,
  expiry: Date,
  createdAt: { type: Date, default: Date.now },
  clicks: [clickSchema],
});

const ShortUrl = mongoose.model('ShortUrl', urlSchema);
export default ShortUrl;
