// server.js - COMPLETE WORKING VERSION (FIXED)
import express, { json } from 'express';
import cors from 'cors';
import ExcelJS from 'exceljs';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore'; // ADD THIS IMPORT
import { serviceAccount } from './firebase-config.js';


// Load environment variables FIRST
dotenv.config();

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error("Firebase Error:", error);
  db = null;
}




const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS Configuration
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
        is_past: true
    },
    {
        id: 2,
        title: 'Chaye Crypto Meetup',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875239/event-2_bfm5ik.jpg',
        description: 'Discuss crypto over chai',
        event_date: '2026-02-15T16:00:00Z',
        is_past: true
    },
    {
        id: 3,
        title: 'Art & Sip Workshop',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1767875240/event-4_xhsd71.jpg',
        description: 'Paint and sip with friends',
        event_date: '2026-01-25T18:00:00Z',
        is_past: true
    },
    {
        id: 4,
        title: 'Tech Community Meetup',
        image_url: 'https://res.cloudinary.com/dldcsklkm/image/upload/v1768204023/1_19_e5ocx0.jpg',
        description: 'Network with tech professionals',
        event_date: '2026-02-15T16:00:00Z',
        is_past: true
    }
];


app.get('/api/debug/firebase', async (req, res) => {
    try {
        const info = {
            firebase_initialized: !!db,
            project_id: process.env.FIREBASE_PROJECT_ID || 'Not set',
            client_email: process.env.FIREBASE_CLIENT_EMAIL || 'Not set',
            private_key_set: process.env.FIREBASE_PRIVATE_KEY ? `Yes (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'No',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };
        
        // Try to test Firestore if available
        if (db) {
            try {
                const testDoc = await db.collection('test').doc('connection-test').get();
                info.firestore_test = testDoc.exists ? 'Success' : 'Test document not found';
                
                // Count registrations
                const regsRef = db.collection('registrations');
                const snapshot = await regsRef.count().get();
                info.registration_count = snapshot.data().count;
            } catch (firestoreError) {
                info.firestore_test = `Error: ${firestoreError.message}`;
            }
        }
        
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// In-memory storage for registrations (fallback)
let memoryRegistrations = [];

// =====================
// HEALTH CHECK
// =====================
app.get('/api/health', async (req, res) => {
    try {
        res.json({
            status: 'OK',
            message: 'JUNO Backend is running',
            timestamp: new Date().toISOString(),
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            firebase: db ? 'Connected' : 'Not connected',
            events_count: STATIC_EVENTS.length
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
        firebase: db ? 'Connected' : 'Using fallback',
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
        // If Firebase is available, try to get events
        if (db) {
            console.log('📡 Fetching events from Firestore...');
            const eventsRef = db.collection('events');
            const snapshot = await eventsRef.orderBy('event_date', 'desc').get();
            
            if (!snapshot.empty) {
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
            }
        }
        
        // Fallback to static events
        console.log('📭 Using static events');
        return res.json(STATIC_EVENTS);
        
    } catch (error) {
        console.error('❌ Events error:', error.message);
        console.log('🔄 Returning static events as fallback');
        return res.json(STATIC_EVENTS);
    }
});

// =====================
// EVENT TIME FOR COUNTDOWN
// =====================
app.get('/api/next-event-time', async (req, res) => {
    try {
        // If Firebase is available
        if (db) {
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
        }
        
        // Fallback to static event time
        const upcomingEvents = STATIC_EVENTS.filter(event => !event.is_past);
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
    
    // ✅ CHECK IF FIREBASE IS AVAILABLE
    if (!db) {
        console.log('⚠️ Firebase not available, saving to memory');
        
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
            message: 'Registration saved (offline mode)',
            id: newReg.id,
            timestamp: newReg.created_at
        });
    }
    
    try {
        // Check if email already registered in Firebase
        const registrationsRef = db.collection('registrations');
        const emailCheck = await registrationsRef.where('email', '==', email).get();
        
        if (!emailCheck.empty) {
            return res.status(400).json({
                error: 'Email already registered',
                success: false
            });
        }
        
        // ✅ FIXED: Use FieldValue correctly
        const registrationData = {
            name,
            email,
            contact_no,
            designation,
            organisation,
            created_at: FieldValue.serverTimestamp(), // This is now properly imported
            timestamp: new Date().toISOString()
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
        console.error('❌ Firestore error:', error.message);
        console.error('Error details:', error);
        
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
            message: 'Registration received (Firestore offline)',
            id: newReg.id,
            timestamp: newReg.created_at,
            warning: 'Saved locally only'
        });
    }
});

// =====================
// ADMIN APIS
// =====================
app.get('/api/admin/registrations', async (req, res) => {
    try {
        let registrations = [];
        
        // Try Firebase first
        if (db) {
            try {
                const registrationsRef = db.collection('registrations');
                const snapshot = await registrationsRef.orderBy('created_at', 'desc').get();
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    registrations.push({
                        id: doc.id,
                        name: data.name || '',
                        email: data.email || '',
                        contact_no: data.contact_no || '',
                        designation: data.designation || '',
                        organisation: data.organisation || '',
                        created_at: data.created_at?.toDate ? 
                            data.created_at.toDate().toISOString() : 
                            data.timestamp || new Date().toISOString()
                    });
                });
            } catch (firestoreError) {
                console.error('Firestore error:', firestoreError.message);
            }
        }
        
        // If no Firebase data, use memory
        if (registrations.length === 0) {
            registrations = memoryRegistrations;
        }
        
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
        let registrations = [];
        
        // Try Firebase first
        if (db) {
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
                            data.timestamp || new Date().toLocaleString()
                    });
                });
            } catch (firestoreError) {
                console.error('Firestore export error:', firestoreError.message);
            }
        }
        
        // If no Firebase data, use memory
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
║ 🗄️  Database: ${db ? 'Firebase Firestore' : 'Memory (Fallback)'.padEnd(19)} ║
║ 🌐 Server URL: ${serverUrl.padEnd(26)} ║
║ 🔥 Events: ${STATIC_EVENTS.length} (${STATIC_EVENTS.filter(e => !e.is_past).length} upcoming) ║
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
    console.log(`ℹ️  Firebase: ${db ? 'Connected ✓' : 'Using fallback storage'}`);
});