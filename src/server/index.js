import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL

app.post('/api', async (req, res) => {
    try {
        if (!GOOGLE_SCRIPT_URL) throw new Error('GOOGLE_SCRIPT_URL not set');

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

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api', async (req, res) => {
    try {
        if (!GOOGLE_SCRIPT_URL) throw new Error('GOOGLE_SCRIPT_URL not set');
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

        // Process all data with consistent field names
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

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))