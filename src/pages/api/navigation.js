export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return fixed positions or any server-side logic you need
    return res.status(200).json({ position: 0 });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
