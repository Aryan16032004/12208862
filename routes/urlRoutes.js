import express from 'express';
import { createShortUrl, getShortUrlStats, redirectShortUrl } from '../controllers/urlController.js';

const router = express.Router();

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode',getShortUrlStats);
router.get('/:shortcode', redirectShortUrl);

export default router;
