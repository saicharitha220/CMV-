import express from 'express';
import { getAllContent, getContentByKey } from '../controllers/contentController.js';

const router = express.Router();
router.get('/', getAllContent);
router.get('/:key', getContentByKey);

export default router;
