/**
 * Server-side proxy for Google Places Nearby Search API.
 * The API key never leaves the server — the client only receives place results.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng, radius, type, keyword } = req.query;

  if (!lat || !lng || !radius || !type) {
    return res.status(400).json({ error: 'Missing required parameters: lat, lng, radius, type' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  // Validate numeric inputs to prevent injection
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const radiusNum = parseInt(radius, 10);

  if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
    return res.status(400).json({ error: 'Invalid numeric parameters' });
  }
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Coordinates out of range' });
  }
  if (radiusNum < 1 || radiusNum > 50000) {
    return res.status(400).json({ error: 'Radius must be between 1 and 50000' });
  }

  let url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${latNum},${lngNum}` +
    `&radius=${radiusNum}` +
    `&type=${encodeURIComponent(type)}` +
    `&language=ja` +
    `&key=${apiKey}`;

  if (keyword) {
    url += `&keyword=${encodeURIComponent(String(keyword).slice(0, 200))}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream Places API error', status: response.status });
    }
    const data = await response.json();

    // Strip the API key from any forwarded error messages
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Places proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch places' });
  }
}
