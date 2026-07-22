import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getAllContent, getContentByKey, createContent, updateContent, deleteContent } from '../controllers/contentController.js';

const router = express.Router();
router.use(protect);
router.get('/', getAllContent);
router.get('/:key', getContentByKey);
router.post('/', createContent);
router.put('/:key', updateContent);
router.delete('/:key', deleteContent);

export default router;
