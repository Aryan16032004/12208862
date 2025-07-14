import ShortUrl from '../models/urlModel.js';
import nanoid from '../utils/generateCode.js';
import Log from '../middleware/logger.js';

export const createShortUrl = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  try {
    if (!url) {
      await Log("backend", "error", "handler", "Missing URL in request body");
      return res.status(400).json({ error: "URL is required" });
    }

    let code = shortcode || nanoid();
    const existing = await ShortUrl.findOne({ shortcode: code });

    if (existing) {
      await Log("backend", "warn", "handler", `Shortcode collision for: ${code}`);
      return res.status(409).json({ error: "Shortcode already in use" });
    }

    const expiry = new Date(Date.now() + validity * 60000);

    const shortUrl = await ShortUrl.create({
      shortcode: code,
      originalUrl: url,
      expiry,
    });

    await Log("backend", "info", "controller", `Short URL created for ${url} -> ${code}`);

    res.status(201).json({
      shortLink: `${process.env.HOSTNAME}/${code}`,
      expiry: expiry.toISOString(),
    });

  } catch (err) {
    await Log("backend", "fatal", "db", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const redirectShortUrl = async (req, res) => {
  const { shortcode } = req.params;

  try {
    const entry = await ShortUrl.findOne({ shortcode });

    if (!entry) {
      await Log("backend", "warn", "handler", `Shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: "Short URL not found" });
    }

    if (new Date() > new Date(entry.expiry)) {
      await Log("backend", "info", "handler", `Expired shortcode accessed: ${shortcode}`);
      return res.status(410).json({ error: "Short URL has expired" });
    }

   
    entry.clicks.push({
      timestamp: new Date(),
      referrer: req.get('referrer') || 'direct',
      geo: req.ip, 
    });

    await entry.save();
    await Log("backend", "info", "service", `Redirected to ${entry.originalUrl}`);

    res.redirect(entry.originalUrl);

  } catch (err) {
    await Log("backend", "fatal", "db", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getShortUrlStats = async (req, res) => {
  const { shortcode } = req.params;

  try {
    const entry = await ShortUrl.findOne({ shortcode });

    if (!entry) {
      await Log("backend", "warn", "handler", `Stats requested for non-existent shortcode: ${shortcode}`);
      return res.status(404).json({ error: "Short URL not found" });
    }

    await Log("backend", "info", "controller", `Stats retrieved for ${shortcode}`);

    res.json({
      originalUrl: entry.originalUrl,
      createdAt: entry.createdAt.toISOString(),
      expiry: entry.expiry.toISOString(),
      totalClicks: entry.clicks.length,
      clicks: entry.clicks,
    });

  } catch (err) {
    await Log("backend", "fatal", "db", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
