import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);
export default Content;
