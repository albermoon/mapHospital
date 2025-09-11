import fetch from 'node-fetch';

export default async function handler(req, res) {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {
        return res.status(500).json({
            status: 'error',
            message: 'GOOGLE_SCRIPT_URL not set'
        });
    }

    try {
        if (req.method === 'POST') {
            // Handle POST request
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error('Invalid response from Google Script:\n' + text);
            }

            res.json(data);
        } else if (req.method === 'GET') {
            // Handle GET request
            const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'GET' });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error('Invalid response from Google Script:\n' + text);
            }

            if (data.status === 'error') {
                return res.status(500).json(data);
            }

            // Process data
            const processData = (items, type) => {
                return items.map(item => ({
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
                    Status: item.Status
                }));
            };

            const hospitales = processData(data.hospitales || [], 'Hospital');
            const asociaciones = processData(data.asociaciones || [], 'Association');

            res.json({
                status: 'success',
                data: [...hospitales, ...asociaciones]
            });
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
}