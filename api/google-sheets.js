// Polyfill fetch for Node.js environments (like Vercel serverless)
if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
}

// ----------------------
// In-memory cache
// ----------------------
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

export default async function handler(req, res) {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!GOOGLE_SCRIPT_URL) {
        console.error('❌ GOOGLE_SCRIPT_URL not set in environment variables.');
        return res.status(500).json({
            status: 'error',
            message: 'GOOGLE_SCRIPT_URL not set',
        });
    }

    try {
        // ---------------------------
        // POST — Save data
        // ---------------------------
        if (req.method === 'POST') {
            console.log('📤 Forwarding POST to Google Script...');
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
            });

            const text = await response.text();
            console.log('🧾 Raw response (POST):', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                console.error('❌ Invalid JSON from Google Script (POST)');
                throw new Error('Invalid response from Google Script');
            }

            // Invalidate cache on POST
            cachedData = null;
            cacheTimestamp = 0;

            return res.json(data);
        }

        // ---------------------------
        // GET — Fetch data with caching
        // ---------------------------
        if (req.method === 'GET') {
            const now = Date.now();

            // Serve cached data if still valid
            if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
                return res.json({ status: 'success', data: cachedData, cached: true });
            }

            const sheet = req.query.sheet || 'all';
            console.log(`🌐 Fetching data for sheet: ${sheet}`);

            const start = performance.now();
            const url = new URL(GOOGLE_SCRIPT_URL);
            url.searchParams.set('sheet', sheet);

            const response = await fetch(url.toString());
            const text = await response.text();
            console.log('🧾 Raw response (GET):', text);

            let data;
            try { data = JSON.parse(text); } catch {
                console.error('❌ Invalid JSON from Google Script (GET)');
                throw new Error('Invalid response from Google Script');
            }

            const duration = performance.now() - start;
            console.log(`⏱️ Google Script responded in ${duration.toFixed(2)}ms`);

            // Normalize combined data structure
            const processData = (items, defaultType) =>
                (items || []).map(item => ({
                    ID: item.ID || '',
                    Name: item.Name || '',
                    Type: item.Type || defaultType,
                    Address: item.Address || '',
                    Phone: item.Phone || '',
                    Website: item.Website || '',
                    Email: item.Email || '',
                    Latitude: item.Latitude || '',
                    Longitude: item.Longitude || '',
                    Country: item.Country || '',
                    City: item.City || '',
                    Specialty: item.Specialty || '',
                    Status: item.Status || '',
                }));

            let mergedData = [];
            if (Array.isArray(data.data)) {
                mergedData = data.data;
            } else {
                mergedData = [
                    ...processData(data.hospitales, 'Hospital'),
                    ...processData(data.asociaciones, 'Association'),
                    ...processData(data.organizaciones, 'Organization'),
                ];
            }

            // Update cache
            cachedData = mergedData;
            cacheTimestamp = now;

            return res.json({ status: 'success', data: mergedData, cached: false });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
            status: 'error',
            message: `Method ${req.method} Not Allowed`,
        });

    } catch (err) {
        console.error('❌ Google Sheets API error:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Unexpected server error',
        });
    }
}
