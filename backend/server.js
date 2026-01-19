// server.js - COMPLETE MONGODB ATLAS VERSION FOR JUNO WEBSITE
import express, { json } from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// =====================
// GLOBAL CONSTANTS
// =====================
const GLOBAL_NEXT_EVENT_TIME = '2026-01-29T01:30:00Z';

// =====================
// STATIC DATA (FALLBACK)
// =====================
const STATIC_EVENTS = [

    {
        id: 17,
        title: 'Microsoft Community Event',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768826840/WhatsApp_Image_2026-01-19_at_10.32.16_AM_ytenrj.jpg',
        is_past: false
    }, {
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
// MONGODB CONNECTION
// =====================
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://rashidmareesh:%3CTiger%21%3E@juno-cluster.chzd9fl.mongodb.net/?appName=juno-cluster";

let db = null;
let client = null;
let memoryRegistrations = []; // Memory fallback

async function connectDB() {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');

        client = new MongoClient(mongoURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();
        db = client.db('juno_database');

        // Create collections if they don't exist
        await db.collection('registrations').createIndex({ email: 1 }, { unique: true });
        await db.collection('events').createIndex({ event_date: -1 });

        console.log('✅ MongoDB Atlas Connected!');
        console.log('📍 Region: Singapore (ap-southeast-1)');
        console.log('   Estimated latency to Karachi: 80-120ms');

        // Insert sample events if collection is empty
        const eventsCount = await db.collection('events').countDocuments();
        if (eventsCount === 0) {
            console.log('📝 Inserting sample events...');
            await db.collection('events').insertMany([
                {
                    title: 'Moon Lamp Workshop',
                    description: 'Create your own moon texture lamp',
                    image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-1_ctoxli.jpg',
                    event_date: '2026-01-20T18:00:00Z',
                    location: 'Karachi',
                    created_at: new Date()
                },
                {
                    title: 'Chaye Crypto Meetup',
                    description: 'Discuss crypto over chai',
                    image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-2_bfm5ik.jpg',
                    event_date: '2026-02-15T16:00:00Z',
                    location: 'Karachi',
                    created_at: new Date()
                }
            ]);
        }

    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('⚠️ Using memory storage as fallback');
        db = null;
    }
}

connectDB();

// =====================
// MIDDLEWARE
// =====================
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://juno-website-frontend.onrender.com',
        'https://juno-website-fronted.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(json());

// ✅ Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// =====================
// HEALTH CHECK
// =====================
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = db ? 'Connected to MongoDB' : 'Disconnected (Using memory)';
        let collections = [];

        if (db) {
            collections = await db.listCollections().toArray();
        }

        res.json({
            status: 'OK',
            message: 'JUNO Backend is running',
            timestamp: new Date().toISOString(),
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            database: dbStatus,
            collections: collections.map(c => c.name),
            memory_registrations: memoryRegistrations.length
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// =====================
// ROOT ROUTE
// =====================
app.get('/', (req, res) => {
    res.json({
        message: 'JUNO Event Registration API',
        version: '1.0.0',
        status: 'Active',
        database: db ? 'MongoDB Atlas' : 'Memory (Fallback)',
        endpoints: {
            health: 'GET /api/health',
            events: 'GET /api/events',
            eventTime: 'GET /api/next-event-time',
            register: 'POST /api/register',
            admin: {
                registrations: 'GET /api/admin/registrations',
                export: 'GET /api/admin/export-excel'
            },
            mongodb: {
                status: 'GET /api/mongodb/status',
                test: 'GET /api/mongodb/test'
            }
        }
    });
});

// =====================
// EVENTS API
// =====================
app.get('/api/events', async (req, res) => {
    console.log('📭 Returning static events');
    return res.json(STATIC_EVENTS);
});

// =====================
// EVENT TIME FOR COUNTDOWN
// =====================
app.get('/api/next-event-time', async (req, res) => {
    try {
        // If MongoDB is available
        if (db) {
            const nextEvent = await db.collection('events')
                .find({ event_date: { $gte: new Date() } })
                .sort({ event_date: 1 })
                .limit(1)
                .toArray();

            if (nextEvent.length > 0) {
                return res.json({
                    nextEventTime: nextEvent[0].event_date,
                    eventTitle: nextEvent[0].title,
                    eventFound: true,
                    source: 'mongodb'
                });
            }
        }

        // Fallback to static event time
        const now = new Date();

        const upcomingEvents = STATIC_EVENTS
            .filter(event => {
                const eventTime = new Date(event.event_date);
                return !event.is_past && eventTime > now;
            })
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        if (upcomingEvents.length > 0) {
            return res.json({
                nextEventTime: upcomingEvents[0].event_date,
                eventTitle: upcomingEvents[0].title,
                eventFound: true,
                source: 'static'
            });
        }

        // Default fallback
        return res.json({
            nextEventTime: GLOBAL_NEXT_EVENT_TIME,
            eventTitle: 'Upcoming JUNO Event',
            eventFound: true,
            source: 'fallback'
        });

    } catch (error) {
        console.error('❌ Event time error:', error.message);
        return res.json({
            nextEventTime: GLOBAL_NEXT_EVENT_TIME,
            eventFound: true,
            source: 'error-fallback'
        });
    }
});

// =====================
// REGISTRATION API
// =====================
app.post('/api/register', async (req, res) => {
    console.log('📝 Registration request received:', req.body);

    const { name, email, contact_no, designation, organisation } = req.body;

    // Validation
    if (!name || !email || !contact_no || !designation || !organisation) {
        return res.status(400).json({
            error: 'All fields are required'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // ✅ CHECK IF MONGODB IS AVAILABLE
    if (!db) {
        console.log('⚠️ MongoDB not available, saving to memory');

        // Check if email already exists in memory
        const emailExists = memoryRegistrations.some(reg => reg.email === email);
        if (emailExists) {
            return res.status(400).json({
                error: 'Email already registered',
                success: false
            });
        }

        // Save to memory array
        const newReg = {
            id: memoryRegistrations.length + 1,
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: new Date().toISOString()
        };
        memoryRegistrations.push(newReg);

        return res.json({
            success: true,
            message: 'Registration saved (memory storage)',
            id: newReg.id,
            timestamp: newReg.created_at,
            storage: 'memory'
        });
    }

    try {
        // Check if email already registered in MongoDB
        const registrations = db.collection('registrations');
        const existing = await registrations.findOne({ email });

        if (existing) {
            return res.status(400).json({
                error: 'Email already registered',
                success: false
            });
        }

        // Save to MongoDB
        const result = await registrations.insertOne({
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: new Date(),
            timestamp: new Date().toISOString()
        });

        console.log(`✅ Registration saved to MongoDB. ID: ${result.insertedId}`);

        res.json({
            success: true,
            message: 'Registration successful!',
            id: result.insertedId,
            timestamp: new Date().toISOString(),
            storage: 'mongodb'
        });

    } catch (error) {
        console.error('❌ MongoDB error:', error.message);

        // Check if duplicate key error (MongoDB error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Email already registered',
                success: false
            });
        }

        // Fallback to memory storage
        console.log('🔄 Falling back to memory storage');

        const newReg = {
            id: memoryRegistrations.length + 1,
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: new Date().toISOString()
        };
        memoryRegistrations.push(newReg);

        res.json({
            success: true,
            message: 'Registration received (MongoDB offline)',
            id: newReg.id,
            timestamp: newReg.created_at,
            warning: 'Saved locally only',
            storage: 'memory_fallback'
        });
    }
});

// =====================
// ADMIN APIS
// =====================
app.get('/api/admin/registrations', async (req, res) => {
    try {
        let registrations = [];

        // Try MongoDB first
        if (db) {
            try {
                registrations = await db.collection('registrations')
                    .find({})
                    .sort({ created_at: -1 })
                    .toArray();

                // Format MongoDB data
                registrations = registrations.map((reg, index) => ({
                    index: index + 1,
                    id: reg._id.toString(),
                    name: reg.name || '',
                    email: reg.email || '',
                    contact_no: reg.contact_no || '',
                    designation: reg.designation || '',
                    organisation: reg.organisation || '',
                    created_at: reg.created_at?.toISOString() || new Date().toISOString()
                }));

            } catch (mongodbError) {
                console.error('MongoDB error:', mongodbError.message);
            }
        }

        // If no MongoDB data, use memory
        if (registrations.length === 0) {
            registrations = memoryRegistrations.map((reg, index) => ({
                index: index + 1,
                id: reg.id,
                name: reg.name || '',
                email: reg.email || '',
                contact_no: reg.contact_no || '',
                designation: reg.designation || '',
                organisation: reg.organisation || '',
                created_at: reg.created_at || new Date().toISOString()
            }));
        }

        res.json({
            success: true,
            count: registrations.length,
            data: registrations,
            source: db ? 'mongodb' : 'memory'
        });

    } catch (error) {
        console.error('❌ Admin registrations error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch registrations',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/api/admin/export-excel', async (req, res) => {
    try {
        let registrations = [];

        // Try MongoDB first
        if (db) {
            try {
                registrations = await db.collection('registrations')
                    .find({})
                    .sort({ created_at: 1 })
                    .toArray();

                registrations = registrations.map((reg, index) => ({
                    index: index + 1,
                    id: reg._id.toString(),
                    name: reg.name || '',
                    email: reg.email || '',
                    contact_no: reg.contact_no || '',
                    designation: reg.designation || '',
                    organisation: reg.organisation || '',
                    created_at: reg.created_at?.toLocaleString() || new Date().toLocaleString()
                }));

            } catch (mongodbError) {
                console.error('MongoDB export error:', mongodbError.message);
            }
        }

        // If no MongoDB data, use memory
        if (registrations.length === 0) {
            registrations = memoryRegistrations.map((reg, index) => ({
                index: index + 1,
                id: reg.id,
                name: reg.name || '',
                email: reg.email || '',
                contact_no: reg.contact_no || '',
                designation: reg.designation || '',
                organisation: reg.organisation || '',
                created_at: reg.created_at || new Date().toLocaleString()
            }));
        }

        // If still no registrations
        if (registrations.length === 0) {
            console.log('📭 No registrations found for export');
            registrations = [{
                index: 1,
                name: 'No registrations yet',
                email: '',
                contact_no: '',
                designation: '',
                organisation: '',
                created_at: new Date().toLocaleString()
            }];
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('JUNO Registrations');

        // Headers
        const headers = ['S.No', 'Timestamp', 'Name', 'Email', 'Contact No', 'Designation', 'Organisation'];
        worksheet.addRow(headers);

        // Style header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '520893' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add data
        registrations.forEach(reg => {
            worksheet.addRow([
                reg.index,
                reg.created_at,
                reg.name,
                reg.email,
                reg.contact_no,
                reg.designation,
                reg.organisation
            ]);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        // Set response headers
        const fileName = `juno_registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Send file
        await workbook.xlsx.write(res);

        console.log(`✅ Excel exported: ${registrations.length} records`);

    } catch (error) {
        console.error('❌ Excel export error:', error.message);
        res.status(500).json({
            error: 'Failed to generate Excel file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// =====================
// MONGODB TEST ENDPOINTS
// =====================
app.get('/api/mongodb/status', async (req, res) => {
    try {
        if (!db) {
            return res.json({
                status: 'disconnected',
                message: 'MongoDB not connected',
                using_memory: true,
                memory_registrations: memoryRegistrations.length,
                recommendation: 'Check MONGODB_URI environment variable'
            });
        }

        // Get database stats
        const stats = await db.stats();
        const collections = await db.listCollections().toArray();

        res.json({
            status: 'connected',
            message: 'MongoDB Atlas is working!',
            database: db.databaseName,
            region: 'Singapore (ap-southeast-1)',
            latency: '80-120ms to Pakistan',
            collections: collections.map(c => c.name),
            stats: {
                documents: stats.objects,
                dataSize: `${Math.round(stats.dataSize / 1024 / 1024)}MB`,
                storageSize: `${Math.round(stats.storageSize / 1024 / 1024)}MB`,
                freeStorage: `${Math.round((512 - stats.storageSize / 1024 / 1024))}MB remaining`
            },
            memory_fallback: {
                enabled: memoryRegistrations.length > 0,
                count: memoryRegistrations.length
            }
        });

    } catch (error) {
        res.json({
            status: 'error',
            message: error.message,
            using_memory: true
        });
    }
});

app.get('/api/mongodb/test', async (req, res) => {
    try {
        if (!db) {
            throw new Error('Database not connected');
        }

        const startTime = Date.now();

        // Write test
        const testCollection = db.collection('connection_tests');
        const result = await testCollection.insertOne({
            test: 'MongoDB connection test from Pakistan',
            timestamp: new Date(),
            server: 'juno-backend',
            location: 'Karachi, Pakistan'
        });

        // Read test
        const doc = await testCollection.findOne({ _id: result.insertedId });

        const endTime = Date.now();
        const latency = endTime - startTime;

        res.json({
            success: true,
            message: 'MongoDB connection test successful!',
            latency: `${latency}ms`,
            performance: latency < 200 ? 'Excellent' : latency < 500 ? 'Good' : 'Slow',
            document: {
                ...doc,
                _id: doc._id.toString()
            },
            recommendation: 'Singapore region is optimal for Pakistan'
        });

    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            recommendation: 'Check MongoDB Atlas connection settings'
        });
    }
});

// =====================
// ERROR HANDLING
// =====================
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const serverUrl = isProduction
        ? 'https://juno-website-backend.onrender.com'
        : `http://localhost:${PORT}`;

    console.log(`
╔══════════════════════════════════════════════════════════╗
║                   🚀 JUNO BACKEND SERVER                 ║
╠══════════════════════════════════════════════════════════╣
║ 📍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)} ║
║ 🔢 Port: ${String(PORT).padEnd(33)} ║
║ 🗄️  Database: ${db ? 'MongoDB Atlas ✓' : 'Memory (Fallback)'.padEnd(19)} ║
║ 🌐 Server URL: ${serverUrl.padEnd(26)} ║
║ 🇵🇰 Optimized for: Pakistan (Singapore Region) ║
║ 🔥 Events: ${STATIC_EVENTS.length} (${STATIC_EVENTS.filter(e => !e.is_past).length} upcoming) ║
╚══════════════════════════════════════════════════════════╝
    `);

    console.log('\n📡 API ENDPOINTS:');
    console.log('├─ 🔗 Health Check'.padEnd(30) + `${serverUrl}/api/health`);
    console.log('├─ 🎪 Events'.padEnd(30) + `${serverUrl}/api/events`);
    console.log('├─ ⏰ Countdown Timer'.padEnd(30) + `${serverUrl}/api/next-event-time`);
    console.log('├─ 📝 Registration'.padEnd(30) + `${serverUrl}/api/register`);
    console.log('├─ 📊 Admin Registrations'.padEnd(30) + `${serverUrl}/api/admin/registrations`);
    console.log('├─ 📈 Excel Export'.padEnd(30) + `${serverUrl}/api/admin/export-excel`);
    console.log('├─ 🗄️  MongoDB Status'.padEnd(30) + `${serverUrl}/api/mongodb/status`);
    console.log('└─ 🧪 MongoDB Test'.padEnd(30) + `${serverUrl}/api/mongodb/test`);

    console.log('\n⚡ STATUS: Server is running and ready!');
    console.log(`🇵🇰 Optimized for Pakistan users (Singapore region)`);
    console.log(`💾 Memory registrations: ${memoryRegistrations.length}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing MongoDB connection');
    if (client) {
        await client.close();
    }
    process.exit(0);
});