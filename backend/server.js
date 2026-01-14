// server.js - COMPLETE FIREBASE VERSION
import express, { json } from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';

// ✅ Firebase Admin Setup (REPLACES MySQL)
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load Firebase service account key
const serviceAccount = JSON.parse(
  readFileSync('./juno-backend-107fc-firebase-adminsdk-fbsvc-e925534d8d.json', 'utf8')
);

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount)
});

// Initialize Firestore Database
const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 3002; // ✅ Important for deployment

// JUNO Color Scheme
const JUNO_COLORS = {
    primaryPurple: "520893",
    accentYellow: "FEC732",
    lightGray: "F2F2F2",
    darkGray: "333333",
    white: "FFFFFF"
};

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-frontend-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(json());

// =====================
// REQUEST LOGGER (For Debugging)
// =====================
// app.use((req, res, next) => {
//     console.log('\n=== NEW REQUEST ===');
//     console.log('Time:', new Date().toISOString());
//     console.log('Method:', req.method);
//     console.log('URL:', req.url);
//     console.log('Path:', req.path);
//     console.log('Headers:', req.headers['content-type']);
//     console.log('Body:', req.body);
//     console.log('=== END REQUEST ===\n');
//     next();
// });

// =====================
// GLOBAL EVENT TIME FOR COUNTDOWN (Fallback)
// =====================
const GLOBAL_NEXT_EVENT_TIME = '2026-01-15T18:00:00Z';

// ✅ Firebase doesn't need table creation - Collections are created automatically

// ✅ 2. HEALTH CHECK
app.get('/api/health', async (req, res) => {
    try {
        // Test Firestore connection
        await db.collection('health').doc('test').set({ test: true });
        await db.collection('health').doc('test').delete();
        
        res.json({
            status: 'OK',
            database: 'Firebase Firestore Connected',
            port: PORT,
            collections: ['events', 'registrations']
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message
        });
    }
});

// =====================
// ROOT ROUTE
// =====================
app.get('/', (req, res) => {
    res.json({
        message: 'JUNO Event Registration API (Firebase Edition)',
        version: '3.0.0 (Firebase)',
        port: PORT,
        database: 'Firebase Firestore',
        endpoints: {
            health: 'GET /api/health',
            events: 'GET /api/events',
            eventTime: 'GET /api/next-event-time',
            register: 'POST /api/register',
            admin: {
                registrations: 'GET /api/admin/registrations',
                export: 'GET /api/admin/export-excel',
                clear: 'DELETE /api/admin/clear-registrations'
            }
        }
    });
});

// =====================
// STATIC EVENTS FALLBACK
// =====================
const STATIC_EVENTS = [
    {
        id: 1,
        title: 'Moon Lamp Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-1_ctoxli.jpg',
        is_past: true
    },
    {
        id: 2,
        title: 'Chaye Crypto Meetup',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-2_bfm5ik.jpg',
        is_past: true
    },
    {
        id: 3,
        title: 'Cushion Making Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875241/event-3_mzr6wq.jpg',
        is_past: true
    },
    {
        id: 4,
        title: 'Community Meetup',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875240/event-4_xhsd71.jpg',
        is_past: true
    },
    {
        id: 5,
        title: 'Ceramic Tary Painting Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204023/1_20_hyqmok.jpg',
        is_past: true
    },
    {
        id: 6,
        title: 'Watch party snacks and drinks',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204023/1_31_wddr9w.jpg',
        is_past: true
    },
    {
        id: 7,
        title: 'Play on canvas and clay',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204023/1_19_e5ocx0.jpg',
        is_past: true
    },
    {
        id: 8,
        title: 'Clay Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_30_hlskpm.jpg',
        is_past: true
    },
    {
        id: 9,
        title: 'Block Paint Magic',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_22_ntjrgg.jpg',
        is_past: true
    },
    {
        id: 10,
        title: 'Block Painting',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204021/1_21_kkfawa.jpg',
        is_past: true
    },
    {
        id: 11,
        title: 'CLay & Create',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_16_mq1eft.jpg',
        is_past: true
    },
    {
        id: 12,
        title: 'Block Paint Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_13_z9ra9x.jpg',
        is_past: true
    },
    {
        id: 13,
        title: 'Sip & Paint',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_15_mdpe6i.jpg',
        is_past: true
    },
    {
        id: 14,
        title: 'Neon Painting Party',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204022/1_14_a7srbn.jpg',
        is_past: true
    },
    {
        id: 15,
        title: 'Blind Date With A Book',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204021/1_11_pnsgew.jpg',
        is_past: true
    },
    {
        id: 16,
        title: 'Latte Candle Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204021/1_12_hsswh9.jpg',
        is_past: true
    }
];

// =====================
// EVENTS API (Firebase Version)
// =====================
app.get('/api/events', async (req, res) => {
    try {
        // Get events from Firestore
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.orderBy('event_date', 'desc').get();
        
        if (!snapshot.empty) {
            const events = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const eventDate = data.event_date.toDate ? data.event_date.toDate() : new Date(data.event_date);
                events.push({
                    id: doc.id,
                    ...data,
                    event_date: data.event_date,
                    is_past: eventDate < new Date()
                });
            });
            
            console.log(`✅ Returning ${events.length} events from Firestore`);
            return res.json(events);
        } else {
            console.log('⚠️ Firestore empty, returning static events');
            return res.json(STATIC_EVENTS);
        }
    } catch (error) {
        console.error('❌ Firestore error, returning static events:', error.message);
        return res.json(STATIC_EVENTS);
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('events').doc(id);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            const eventDate = data.event_date.toDate ? data.event_date.toDate() : new Date(data.event_date);
            res.json({
                id: doc.id,
                ...data,
                is_past: eventDate < new Date()
            });
        } else {
            // Check static events if not found in Firestore
            const staticEvent = STATIC_EVENTS.find(event => event.id == id);
            if (staticEvent) {
                return res.json(staticEvent);
            }
            return res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        console.error('Event detail error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// =====================
// COUNTDOWN EVENT TIME (Firebase Version)
// =====================
let cachedEventTime = null;
let cacheTime = 0;
const CACHE_DURATION = 60000;

app.get('/api/next-event-time', async (req, res) => {
    const now = Date.now();
    if (cachedEventTime && (now - cacheTime) < CACHE_DURATION) {
        console.log('✅ Returning cached event time');
        return res.json(cachedEventTime);
    }

    try {
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef
            .where('event_date', '>', new Date())
            .orderBy('event_date', 'asc')
            .limit(1)
            .get();
        
        let response;
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const data = doc.data();
                response = {
                    nextEventTime: data.event_date,
                    eventFound: true,
                    source: 'firebase'
                };
            });
        } else {
            response = {
                eventStartTime: GLOBAL_NEXT_EVENT_TIME,
                serverTime: new Date().toISOString(),
                eventFound: true,
                source: 'static'
            };
        }

        cachedEventTime = response;
        cacheTime = now;

        console.log('✅ Returning fresh event time (cached)');
        res.json(response);
    } catch (error) {
        console.error('Event time error:', error);
        if (cachedEventTime) {
            console.log('⚠️ Firestore error, returning cached data');
            return res.json(cachedEventTime);
        }
        res.json({
            eventStartTime: GLOBAL_NEXT_EVENT_TIME,
            serverTime: new Date().toISOString(),
            eventFound: true,
            source: 'fallback'
        });
    }
});

// =====================
// REGISTRATION ENDPOINTS (Firebase Version)
// =====================
app.get('/api/register', (req, res) => {
    console.log('✅ GET request received at /api/register');
    res.json({
        message: 'This endpoint requires POST method',
        example: 'POST /api/register with JSON body',
        required_fields: ['name', 'email', 'contact_no', 'designation', 'organisation']
    });
});

app.post('/api/register', async (req, res) => {
    console.log('📝 Registration request received:', req.body);

    const { name, email, contact_no, designation, organisation } = req.body;

    if (!name || !email || !contact_no || !designation || !organisation) {
        return res.status(400).json({
            error: 'All fields are required'
        });
    }

    try {
        const registrationsRef = db.collection('registrations');
        const docRef = await registrationsRef.add({
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: Timestamp.now()
        });

        console.log(`✅ Registration saved to Firestore. ID: ${docRef.id}`);

        res.json({
            success: true,
            message: 'Registration saved successfully',
            id: docRef.id
        });
    } catch (error) {
        console.error('❌ Firestore error:', error);
        res.status(500).json({
            error: 'Failed to save registration',
            details: error.message
        });
    }
});

// =====================
// ADMIN APIS (Firebase Version)
// =====================
app.get('/api/admin/registrations', async (req, res) => {
    try {
        const registrationsRef = db.collection('registrations');
        const snapshot = await registrationsRef.orderBy('created_at', 'desc').get();
        
        const registrations = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            registrations.push({
                id: doc.id,
                ...data,
                created_at: data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at
            });
        });
        
        res.json(registrations);
    } catch (error) {
        console.error('Admin error:', error);
        res.status(500).json({ error: 'Firestore error' });
    }
});

app.get('/api/admin/export-excel', async (req, res) => {
    try {
        // Get registrations from Firestore in ASCENDING order
        const registrationsRef = db.collection('registrations');
        const snapshot = await registrationsRef.orderBy('created_at', 'asc').get();
        
        const rows = [];
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            rows.push({
                id: doc.id,
                index: index + 1,
                created_at: data.created_at.toDate ? data.created_at.toDate() : new Date(data.created_at),
                name: data.name,
                email: data.email,
                contact_no: data.contact_no,
                designation: data.designation,
                organisation: data.organisation
            });
        });

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No registrations found' });
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();

        // Main sheet
        const worksheet = workbook.addWorksheet('JUNO Registrations');

        // Define headers
        const headerRow = worksheet.addRow([
            'S.No',
            'Timestamp',
            'Name',
            'Email',
            'Contact No',
            'Designation',
            'Organisation'
        ]);

        // Style header row
        headerRow.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 12
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF520893' }
        };
        headerRow.alignment = {
            vertical: 'middle',
            horizontal: 'center'
        };
        headerRow.height = 25;

        // Add border to header cells
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add data rows in ASCENDING order (oldest first)
        rows.forEach((row, index) => {
            const dataRow = worksheet.addRow([
                index + 1,  // S.No
                row.created_at.toLocaleString(),  // Timestamp
                row.name,  // Name
                row.email,  // Email
                row.contact_no,  // Contact No
                row.designation,  // Designation
                row.organisation   // Organisation
            ]);

            // Alternate row colors
            if (index % 2 === 0) {
                dataRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF2F2F2' }
                };
            }

            // Add borders to all cells
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Center align S.No column
            const snoCell = dataRow.getCell(1);
            snoCell.alignment = { horizontal: 'center' };
        });

        // Set column widths
        worksheet.columns = [
            { width: 8 },   // S.No
            { width: 22 },  // Timestamp
            { width: 20 },  // Name
            { width: 30 },  // Email
            { width: 15 },  // Contact No
            { width: 25 },  // Designation
            { width: 35 }   // Organisation
        ];

        // Freeze header row (row 1)
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1 }
        ];

        // Info sheet
        const infoSheet = workbook.addWorksheet('Report Info');

        // Title
        infoSheet.mergeCells('A1:B1');
        const titleCell = infoSheet.getCell('A1');
        titleCell.value = 'JUNO Event Registrations';
        titleCell.font = {
            bold: true,
            size: 16,
            color: { argb: 'FF520893' }
        };
        titleCell.alignment = { horizontal: 'center' };

        // Details
        infoSheet.addRow([]);
        infoSheet.addRow(['Report Generated:', new Date().toLocaleString()]);
        infoSheet.addRow(['Total Registrations:', rows.length]);
        infoSheet.addRow([]);
        infoSheet.addRow(['Contact:', 'contact@juno.com']);
        infoSheet.addRow(['Website:', 'https://juno.com']);

        // Set column widths for info sheet
        infoSheet.getColumn(1).width = 25;
        infoSheet.getColumn(2).width = 30;

        // Set response headers
        const fileName = `JUNO_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Write to response
        await workbook.xlsx.write(res);

        console.log(`✅ Excel exported from Firestore: ${rows.length} records`);

    } catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({
            error: 'Failed to export Excel',
            details: error.message
        });
    }
});

app.delete('/api/admin/clear-registrations', async (req, res) => {
    try {
        // Delete all registrations from Firestore
        const registrationsRef = db.collection('registrations');
        const snapshot = await registrationsRef.get();
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        res.json({
            success: true,
            message: 'All registrations cleared from Firestore'
        });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: 'Failed to clear registrations' });
    }
});

// =====================
// ADD SAMPLE DATA TO FIRESTORE
// =====================
app.post('/api/sample-events', async (req, res) => {
    try {
        const sampleEvents = [
            {
                title: 'Moon Lamp Workshop',
                description: 'Create your own moon texture',
                image_url: 'https://picsum.photos/seed/moon/600/400',
                event_date: Timestamp.fromDate(new Date('2024-03-15T18:00:00')),
                city: 'Karachi'
            },
            {
                title: 'Chaye Crypto Meetup',
                description: 'Crypto discussion over tea',
                image_url: 'https://picsum.photos/seed/crypto/600/400',
                event_date: Timestamp.fromDate(new Date('2024-02-20T16:00:00')),
                city: 'Lahore'
            },
            {
                title: 'Saree Espresso Party',
                description: 'Traditional meetup',
                image_url: 'https://picsum.photos/seed/saree/600/400',
                event_date: Timestamp.fromDate(new Date('2024-01-10T14:00:00')),
                city: 'Islamabad'
            }
        ];

        const batch = db.batch();
        const eventsRef = db.collection('events');
        
        sampleEvents.forEach(event => {
            const docRef = eventsRef.doc();
            batch.set(docRef, event);
        });
        
        await batch.commit();

        res.json({ success: true, message: 'Sample events added to Firestore' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =====================
// ERROR HANDLING
// =====================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: Firebase Firestore`);
    console.log(`📈 Using exceljs for Excel exports`);

    console.log('\n✅ Available Endpoints:');
    console.log(`🔗 Health Check:    http://localhost:${PORT}/api/health`);
    console.log(`📝 Registration:    POST http://localhost:${PORT}/api/register`);
    console.log(`⏰ Countdown Time:  http://localhost:${PORT}/api/next-event-time`);
    console.log(`🎪 Events:          http://localhost:${PORT}/api/events`);
    console.log(`📊 Excel Export:    http://localhost:${PORT}/api/admin/export-excel`);
});