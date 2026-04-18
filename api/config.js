export default function handler(req, res) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  // Cache for 1 hour, CDN-cacheable only for same origin
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.status(200).json({ apiKey });
}
