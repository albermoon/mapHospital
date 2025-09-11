// Polyfill fetch for Node.js if not available
if (!global.fetch) {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
  
  export default async function handler(req, res) {
      const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  
      if (!GOOGLE_SCRIPT_URL) {
          return res.status(500).json({
              status: 'error',
              message: 'GOOGLE_SCRIPT_URL not set',
          });
      }
  
      try {
          // POST request handler
          if (req.method === 'POST') {
              const response = await fetch(GOOGLE_SCRIPT_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(req.body),
              });
  
              const text = await response.text();
              let data;
              try {
                  data = JSON.parse(text);
              } catch {
                  console.error('Invalid response from Google Script:', text);
                  throw new Error('Failed to fetch data from Google Script');
              }
  
              return res.json(data);
          }
  
          // GET request handler
          if (req.method === 'GET') {
              const url = new URL(GOOGLE_SCRIPT_URL);
              if (req.query.sheet) {
                  url.searchParams.set('sheet', req.query.sheet);
              }
  
              const response = await fetch(url.toString(), { method: 'GET' });
              const text = await response.text();
              let data;
              try {
                  data = JSON.parse(text);
              } catch {
                  console.error('Invalid response from Google Script:', text);
                  throw new Error('Failed to fetch data from Google Script');
              }
  
              if (data.status === 'error') {
                  return res.status(500).json(data);
              }
  
              const processData = (items, type) =>
                  items.map((item) => ({
                      ID: item.ID,
                      Name: item.Name,
                      Type: type,
                      Address: item.Address,
                      Phone: item.Phone,
                      Website: item.Website,
                      Email: item.Email,
                      Latitude: item.Latitude,
                      Longitude: item.Longitude,
                      Country: item.Country,
                      City: item.City,
                      Specialty: item.Specialty,
                      Status: item.Status,
                  }));
  
              const hospitales = processData(data.hospitales || [], 'Hospital');
              const asociaciones = processData(data.asociaciones || [], 'Association');
  
              return res.json({
                  status: 'success',
                  data: [...hospitales, ...asociaciones],
              });
          }
  
          // Method not allowed
          res.setHeader('Allow', ['GET', 'POST']);
          res.status(405).end(`Method ${req.method} Not Allowed`);
      } catch (err) {
          console.error(err);
          res.status(500).json({ status: 'error', message: err.message });
      }
  }