/**
 * Server-side proxy for Google Directions API (walking mode).
 * The API key never leaves the server — the client receives only route data.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin_lat, origin_lng, dest_lat, dest_lng } = req.query;

  if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
    return res
      .status(400)
      .json({ error: 'Missing required parameters: origin_lat, origin_lng, dest_lat, dest_lng' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  // Validate numeric inputs
  const oLat = parseFloat(origin_lat);
  const oLng = parseFloat(origin_lng);
  const dLat = parseFloat(dest_lat);
  const dLng = parseFloat(dest_lng);

  for (const v of [oLat, oLng, dLat, dLng]) {
    if (isNaN(v)) {
      return res.status(400).json({ error: 'Invalid numeric coordinate' });
    }
  }
  if (oLat < -90 || oLat > 90 || dLat < -90 || dLat > 90) {
    return res.status(400).json({ error: 'Latitude out of range' });
  }
  if (oLng < -180 || oLng > 180 || dLng < -180 || dLng > 180) {
    return res.status(400).json({ error: 'Longitude out of range' });
  }

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${oLat},${oLng}` +
    `&destination=${dLat},${dLng}` +
    `&mode=walking` +
    `&language=ja` +
    `&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(502)
        .json({ error: 'Upstream Directions API error', status: response.status });
    }
    const data = await response.json();

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Directions proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch directions' });
  }
}
