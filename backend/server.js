// server.js - COMPLETE WORKING FIREBASE VERSION
import express, { json } from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ✅ CORRECT FIREBASE INITIALIZATION
// Method 1: Use environment variables (Recommended for Render)
let serviceAccount;

if (process.env.FIREBASE_PROJECT_ID) {
    // Use environment variables (Production - Render)
    serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
    console.log('✅ Using Firebase from environment variables');
} else {
    console.error('❌ Firebase environment variables not set');
    process.exit(1);
}

// Initialize Firebase (only once)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        process.exit(1);
    }
}

// Get Firestore instance
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS Configuration - Update with your frontend URL
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://juno-website-frontend.onrender.com',
        'https://juno-website-fronted.onrender.com' // Fixed typo if needed
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
// GLOBAL CONSTANTS
// =====================
const GLOBAL_NEXT_EVENT_TIME = '2026-01-20T18:00:00Z';

// =====================
// STATIC DATA (FALLBACK)
// =====================
const STATIC_EVENTS = [
    {
        id: 1,
        title: 'Moon Lamp Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-1_ctoxli.jpg',
        description: 'Create your own moon texture lamp',
        event_date: '2026-01-20T18:00:00Z',
        is_past: false
    },
    {
        id: 2,
        title: 'Chaye Crypto Meetup',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-2_bfm5ik.jpg',
        description: 'Discuss crypto over chai',
        event_date: '2026-02-15T16:00:00Z',
        is_past: false
    }
];

// =====================
// HEALTH CHECK
// =====================
app.get('/api/health', async (req, res) => {
    try {
        // Simple test without Firestore
        res.json({
            status: 'OK',
            message: 'JUNO Backend is running',
            timestamp: new Date().toISOString(),
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            firebase: 'Configured'
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
        endpoints: {
            health: 'GET /api/health',
            events: 'GET /api/events',
            eventTime: 'GET /api/next-event-time',
            register: 'POST /api/register',
            admin: {
                registrations: 'GET /api/admin/registrations',
                export: 'GET /api/admin/export-excel'
            }
        }
    });
});

// =====================
// EVENTS API
// =====================
app.get('/api/events', async (req, res) => {
    try {
        console.log('📡 Fetching events from Firestore...');
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.orderBy('event_date', 'desc').get();
        
        if (snapshot.empty) {
            console.log('📭 No events in Firestore, returning static events');
            return res.json(STATIC_EVENTS);
        }
        
        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const eventDate = data.event_date?.toDate ? data.event_date.toDate() : new Date(data.event_date);
            events.push({
                id: doc.id,
                title: data.title || 'Untitled Event',
                description: data.description || '',
                image_url: data.image_url || '',
                event_date: data.event_date,
                location: data.location || '',
                is_past: eventDate < new Date()
            });
        });
        
        console.log(`✅ Returning ${events.length} events from Firestore`);
        return res.json(events);
    } catch (error) {
        console.error('❌ Firestore error:', error.message);
        console.log('🔄 Returning static events as fallback');
        return res.json(STATIC_EVENTS);
    }
});

// =====================
// EVENT TIME FOR COUNTDOWN
// =====================
app.get('/api/next-event-time', async (req, res) => {
    try {
        // Try to get next event from Firestore
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef
            .where('event_date', '>=', new Date())
            .orderBy('event_date', 'asc')
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            let nextEvent = null;
            snapshot.forEach(doc => {
                nextEvent = doc.data();
            });
            
            return res.json({
                nextEventTime: nextEvent.event_date,
                eventTitle: nextEvent.title,
                eventFound: true,
                source: 'firebase'
            });
        }
        
        // Fallback to static event time
        return res.json({
            nextEventTime: GLOBAL_NEXT_EVENT_TIME,
            eventTitle: 'Upcoming JUNO Event',
            eventFound: true,
            source: 'static'
        });
    } catch (error) {
        console.error('❌ Event time error:', error.message);
        return res.json({
            nextEventTime: GLOBAL_NEXT_EVENT_TIME,
            eventFound: true,
            source: 'fallback'
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
            error: 'All fields are required: name, email, contact_no, designation, organisation'
        });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    try {
        // Check if email already registered
        const registrationsRef = db.collection('registrations');
        const emailCheck = await registrationsRef.where('email', '==', email).get();
        
        if (!emailCheck.empty) {
            return res.status(400).json({
                error: 'Email already registered',
                success: false
            });
        }
        
        // Save to Firestore
        const registrationData = {
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: FieldValue.serverTimestamp(),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        };
        
        const docRef = await registrationsRef.add(registrationData);
        
        console.log(`✅ Registration saved to Firestore. ID: ${docRef.id}`);
        
        res.json({
            success: true,
            message: 'Registration successful!',
            id: docRef.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({
            error: 'Failed to save registration. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// =====================
// ADMIN APIS
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
                name: data.name || '',
                email: data.email || '',
                contact_no: data.contact_no || '',
                designation: data.designation || '',
                organisation: data.organisation || '',
                created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString()
            });
        });
        
        res.json({
            success: true,
            count: registrations.length,
            data: registrations
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
        // Get registrations with fallback
        let registrations = [];
        
        try {
            const registrationsRef = db.collection('registrations');
            const snapshot = await registrationsRef.orderBy('created_at', 'asc').get();
            
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                registrations.push({
                    index: index + 1,
                    id: doc.id,
                    name: data.name || '',
                    email: data.email || '',
                    contact_no: data.contact_no || '',
                    designation: data.designation || '',
                    organisation: data.organisation || '',
                    created_at: data.created_at?.toDate ? 
                        data.created_at.toDate().toLocaleString() : 
                        new Date().toLocaleString()
                });
            });
        } catch (firestoreError) {
            console.error('❌ Firestore error in export:', firestoreError.message);
            // Continue with empty array
        }
        
        // If no registrations, return empty Excel
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
        
        // Main sheet
        const worksheet = workbook.addWorksheet('JUNO Registrations');
        
        // Headers
        const headers = ['S.No', 'Timestamp', 'Name', 'Email', 'Contact No', 'Designation', 'Organisation'];
        worksheet.addRow(headers);
        
        // Style header row
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
        
        console.log(`✅ Excel exported successfully: ${registrations.length} records`);
        
    } catch (error) {
        console.error('❌ Excel export error:', error.message);
        res.status(500).json({
            error: 'Failed to generate Excel file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// =====================
// ADD SAMPLE DATA (Optional - for testing)
// =====================
app.post('/api/admin/seed-events', async (req, res) => {
    try {
        const sampleEvents = [
            {
                title: 'Moon Lamp Workshop',
                description: 'Create your own moon texture lamp',
                image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-1_ctoxli.jpg',
                event_date: new Date('2026-01-20T18:00:00Z'),
                location: 'Karachi',
                price: 'Free',
                capacity: 20
            },
            {
                title: 'Chaye Crypto Meetup',
                description: 'Discuss crypto over chai',
                image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-2_bfm5ik.jpg',
                event_date: new Date('2026-02-15T16:00:00Z'),
                location: 'Lahore',
                price: 'Free',
                capacity: 30
            }
        ];
        
        const batch = db.batch();
        const eventsRef = db.collection('events');
        
        sampleEvents.forEach(event => {
            const docRef = eventsRef.doc();
            batch.set(docRef, {
                ...event,
                created_at: FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        
        res.json({
            success: true,
            message: 'Sample events added successfully',
            count: sampleEvents.length
        });
    } catch (error) {
        console.error('❌ Seed events error:', error);
        res.status(500).json({
            error: 'Failed to seed events',
            details: error.message
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
║ 🗄️  Database: Firebase Firestore${' '.padEnd(19)} ║
║ 🌐 Server URL: ${serverUrl.padEnd(26)} ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    console.log('\n📡 API ENDPOINTS:');
    console.log('├─ 🔗 Health Check'.padEnd(30) + `${serverUrl}/api/health`);
    console.log('├─ 🎪 Events'.padEnd(30) + `${serverUrl}/api/events`);
    console.log('├─ ⏰ Countdown Timer'.padEnd(30) + `${serverUrl}/api/next-event-time`);
    console.log('├─ 📝 Registration (POST)'.padEnd(30) + `${serverUrl}/api/register`);
    console.log('├─ 📊 Admin Registrations'.padEnd(30) + `${serverUrl}/api/admin/registrations`);
    console.log('└─ 📈 Excel Export'.padEnd(30) + `${serverUrl}/api/admin/export-excel`);
    
    console.log('\n⚡ STATUS: Server is running and ready!');
});