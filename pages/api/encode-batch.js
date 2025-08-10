export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texts, add_special_tokens } = req.body;

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Texts array is required' });
  }

  try {
    const response = await fetch('https://the-matrix-server.onrender.com/encode-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: texts,
        add_special_tokens: add_special_tokens || false
      })
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
