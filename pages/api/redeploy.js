export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { deployKey } = req.body;

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (deployKey) {
      headers['Authorization'] = `Bearer ${deployKey}`;
    }

    const response = await fetch('https://api.render.com/deploy/srv-d2c4c6ruibrs73841pa0?key=WrxSOJmjDDo', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({})
    });

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}