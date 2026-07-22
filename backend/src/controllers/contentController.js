import Content from '../models/Content.js';

const getAllContent = async (req, res) => {
  const content = await Content.find({});
  res.json(content);
};

const getContentByKey = async (req, res) => {
  const { key } = req.params;
  const content = await Content.findOne({ key });
  if (!content) {
    return res.status(404).json({ message: 'Content not found' });
  }
  res.json(content);
};

const createContent = async (req, res) => {
  const { key, name, description, value } = req.body;
  if (!key || !name || typeof value === 'undefined') {
    return res.status(400).json({ message: 'Key, name, and value are required' });
  }
  const existing = await Content.findOne({ key });
  if (existing) {
    return res.status(400).json({ message: 'Content key already exists' });
  }

  const content = await Content.create({ key, name, description, value });
  res.status(201).json(content);
};

const updateContent = async (req, res) => {
  const { key } = req.params;
  const updates = req.body;
  const content = await Content.findOneAndUpdate({ key }, updates, { new: true, runValidators: true });
  if (!content) {
    return res.status(404).json({ message: 'Content not found' });
  }
  res.json(content);
};

const deleteContent = async (req, res) => {
  const { key } = req.params;
  const content = await Content.findOneAndDelete({ key });
  if (!content) {
    return res.status(404).json({ message: 'Content not found' });
  }
  res.json({ message: 'Content deleted' });
};

export { getAllContent, getContentByKey, createContent, updateContent, deleteContent };
