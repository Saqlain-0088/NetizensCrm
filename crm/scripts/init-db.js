const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'crm.db');

// Delete existing DB to start fresh with new schema
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('Old database removed.');
    } catch (e) {
        console.log('Could not remove old DB, will try to overwrite tables.');
    }
}

const db = new Database(dbPath);

console.log('Initializing Enterprise Database at', dbPath);

const createLeadsTable = `
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    value INTEGER DEFAULT 0,
    source TEXT DEFAULT 'Manual',
    status TEXT DEFAULT 'New', -- New, Contacted, Qualified, Negotiation, Won, Lost
    priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
    tags TEXT, -- JSON string of tags
    location TEXT,
    assigned_to TEXT,
    last_contacted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

const createActionsTable = `
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    parent_action_id INTEGER,
    type TEXT, -- 'Note', 'Call', 'Email', 'Meeting', 'StatusChange', 'System'
    content TEXT,
    created_by TEXT DEFAULT 'System',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
`;

db.exec(createLeadsTable);
db.exec(createActionsTable);

// Seed Data
const seedData = [
    {
        name: 'Sarah Connor',
        company: 'Cyberdyne Systems',
        email: 'sarah@cyberdyne.net',
        phone: '+1 (555) 902-1010',
        value: 125000,
        source: 'LinkedIn',
        status: 'Qualified',
        priority: 'High',
        tags: '["Enterprise", "AI", "Q1"]',
        location: 'San Francisco, CA',
        assigned_to: 'John Smith',
        last_contacted_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        name: 'Elon Reeve',
        company: 'SpaceX',
        email: 'e.reeve@spacex.com',
        phone: '+1 (555) 333-4444',
        value: 5000000,
        source: 'Referral',
        status: 'Negotiation',
        priority: 'Urgent',
        tags: '["Space", "Manufacturing"]',
        location: 'Hawthorne, CA',
        assigned_to: 'John Smith',
        last_contacted_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
        name: 'Sheryl Sandberg',
        company: 'LeanIn.Org',
        email: 'sheryl@leanin.org',
        phone: '+1 (555) 234-5678',
        value: 75000,
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        tags: '["Non-Profit", "Leadership"]',
        location: 'Menlo Park, CA',
        assigned_to: 'Alice Doe',
        last_contacted_at: null
    },
    {
        name: 'Satya Nadella',
        company: 'Microsoft',
        email: 'satya@microsoft.com',
        phone: '+1 (425) 882-8080',
        value: 1200000,
        source: 'Partner',
        status: 'Contacted',
        priority: 'High',
        tags: '["Cloud", "SaaS"]',
        location: 'Redmond, WA',
        assigned_to: 'John Smith',
        last_contacted_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
        name: 'Tim Cook',
        company: 'Apple',
        email: 'tcook@apple.com',
        phone: '+1 (408) 996-1010',
        value: 2500000,
        source: 'Conference',
        status: 'Won',
        priority: 'High',
        tags: '["Consumer Electronics", "Privacy"]',
        location: 'Cupertino, CA',
        assigned_to: 'Alice Doe',
        last_contacted_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
        name: 'Jensen Huang',
        company: 'NVIDIA',
        email: 'jensen@nvidia.com',
        phone: '+1 (408) 486-2000',
        value: 3000000,
        source: 'Direct',
        status: 'Qualified',
        priority: 'Urgent',
        tags: '["Hardware", "Gaming"]',
        location: 'Santa Clara, CA',
        assigned_to: 'John Smith',
        last_contacted_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        name: 'Jeff Bezos',
        company: 'Blue Origin',
        email: 'jeff@blueorigin.com',
        phone: '+1 (206) 123-4567',
        value: 800000,
        source: 'Webinar',
        status: 'Lost',
        priority: 'Low',
        tags: '["Aerospace"]',
        location: 'Kent, WA',
        assigned_to: 'Bob Brown',
        last_contacted_at: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
        name: 'Dara Khosrowshahi',
        company: 'Uber',
        email: 'dara@uber.com',
        phone: '+1 (415) 612-8560',
        value: 450000,
        source: 'Outbound',
        status: 'New',
        priority: 'Medium',
        tags: '["Transport", "Gig Economy"]',
        location: 'San Francisco, CA',
        assigned_to: 'John Smith',
        last_contacted_at: null
    }
];

const insertLead = db.prepare(`
    INSERT INTO leads (name, company, email, phone, value, source, status, priority, tags, location, assigned_to, last_contacted_at)
    VALUES (@name, @company, @email, @phone, @value, @source, @status, @priority, @tags, @location, @assigned_to, @last_contacted_at)
`);

const insertAction = db.prepare(`
    INSERT INTO actions (lead_id, type, content, created_by, created_at)
    VALUES (?, ?, ?, ?, ?)
`);

const transaction = db.transaction((leads) => {
    for (const lead of leads) {
        const info = insertLead.run(lead);
        const leadId = info.lastInsertRowid;

        // Add initial system action
        insertAction.run(leadId, 'System', `Lead created via ${lead.source}`, 'System', new Date().toISOString());

        if (lead.status === 'Won') {
            insertAction.run(leadId, 'StatusChange', 'Deal marked as Won', lead.assigned_to, new Date().toISOString());
        }
        if (lead.status === 'Qualified') {
            insertAction.run(leadId, 'Call', 'Initial discovery call completed. Client is interested in the Enterprise plan.', lead.assigned_to, new Date(Date.now() - 86400000).toISOString());
        }
    }
});

transaction(seedData);

console.log(`Seeded ${seedData.length} leads successfully.`);
