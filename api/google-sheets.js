// Polyfill fetch for Node.js environments (like Vercel serverless)
if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
}

// ----------------------
// In-memory per-sheet cache
// ----------------------
const cachedSheets = {};       // key = sheet name, value = data
const cacheTimestamps = {};    // key = sheet name, value = timestamp
const CACHE_TTL = 30 * 1000;   // 30 seconds

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

            // Invalidate **all cached sheets** on POST
            for (const key in cachedSheets) {
                delete cachedSheets[key];
                delete cacheTimestamps[key];
            }

            return res.json(data);
        }

        // ---------------------------
        // GET — Fetch data with per-sheet caching
        // ---------------------------
        if (req.method === 'GET') {
            const sheet = req.query.sheet || 'all';
            const now = Date.now();

            // Serve cached sheet if still valid
            if (cachedSheets[sheet] && (now - cacheTimestamps[sheet] < CACHE_TTL)) {
                return res.json({ status: 'success', data: cachedSheets[sheet], cached: true });
            }

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

            // Normalize sheet data
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

            let sheetData = [];

            if (Array.isArray(data.data)) {
                // All sheets combined
                sheetData = data.data;
            } else {
                // Individual sheets returned
                switch (sheet.toLowerCase()) {
                    case 'hospitales':
                        sheetData = processData(data.hospitales, 'Hospital');
                        break;
                    case 'asociaciones':
                        sheetData = processData(data.asociaciones, 'Association');
                        break;
                    case 'organizaciones':
                        sheetData = processData(data.organizaciones, 'Organization');
                        break;
                    case 'all':
                        sheetData = [
                            ...processData(data.hospitales, 'Hospital'),
                            ...processData(data.asociaciones, 'Association'),
                            ...processData(data.organizaciones, 'Organization'),
                        ];
                        break;
                    default:
                        sheetData = [];
                }
            }

            // Update cache for this sheet
            cachedSheets[sheet] = sheetData;
            cacheTimestamps[sheet] = now;

            return res.json({ status: 'success', data: sheetData, cached: false });
        }

        // ---------------------------
        // Method not allowed
        // ---------------------------
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
