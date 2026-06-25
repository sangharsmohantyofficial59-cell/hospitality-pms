/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, FileCode, Server, ListCollapse, BookOpen, Rocket, Layout } from "lucide-react";

export default function DevDocsViewer() {
  const [activeTab, setActiveTab] = useState<string>("sql");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sqlCode = `-- ==========================================
-- PMS HOTEL DATABASE DDL SCHEMA (SUPABASE POSTGRES)
-- ==========================================

-- 1. Create Room Types table
CREATE TABLE room_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT
);

-- 2. Create Rooms table
CREATE TABLE rooms (
    id VARCHAR(10) PRIMARY KEY, -- Room number e.g. "101", "302"
    room_type_id VARCHAR(50) REFERENCES room_types(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'))
);

-- 3. Create Guests table 
CREATE TABLE guests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    id_type VARCHAR(50), -- "Passport", "Aadhaar", etc.
    id_number VARCHAR(100),
    id_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Bookings table
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY, -- "BK-1002" etc.
    guest_id VARCHAR(50) REFERENCES guests(id) ON DELETE CASCADE,
    room_id VARCHAR(10) REFERENCES rooms(id) ON DELETE SET NULL,
    room_type_id VARCHAR(50) REFERENCES room_types(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'Website' CHECK (source IN ('Website', 'Walk-in', 'Phone', 'Booking.com', 'MakeMyTrip', 'Agoda')),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Payments table
CREATE TABLE payments (
    id VARCHAR(55) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- "Razorpay", "Cash", "Card"
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Notifications table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- "new_booking", "payment_confirmation", etc.
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Uploaded Documents table
CREATE TABLE uploaded_documents (
    id VARCHAR(50) PRIMARY KEY,
    guest_id VARCHAR(50) REFERENCES guests(id) ON DELETE CASCADE,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Seed Room Types
INSERT INTO room_types (id, name, description, base_price, max_guests, amenities, image_url) VALUES
('std', 'Classic Single Room', 'Centrally air-conditioned perfect for solo travelers.', 1500.00, 1, ARRAY['High-speed Wi-Fi', 'LED Smart TV', 'Compact Work Desk', 'Premium Mattress', 'Ensuite Shower'], 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c'),
('deluxe', 'Deluxe Double Room', 'Spacious double room with wood accents and marble bathroom.', 2800.00, 2, ARRAY['High-speed Wi-Fi', '43\" UHD TV', 'Mini Fridge', 'Rain Shower', 'City View'], 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'),
('exec', 'Executive Twin Premium', 'Luxury workspace integration with enhanced lounge amenities.', 4200.00, 3, ARRAY['High-speed Wi-Fi', '55\" UHD TV', 'Mini Bar', 'Bathrobe', 'Complimentary Breakfast'], 'https://images.unsplash.com/photo-1590490360182-c33d57733427'),
('suite', 'Presidential Skyline Suite', 'Double balconies with skyline views and master bedroom jacuzzi.', 7500.00, 4, ARRAY['Double Balcony', 'Separate Living Room', 'Jacuzzi', 'Mini Bar', 'Butler Service'], 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b');

-- 9. Seed 30 Room Units (Loop is easier in app or direct seeding inserts)
INSERT INTO rooms (id, room_type_id, status) VALUES
('101', 'std', 'Available'), ('102', 'std', 'Available'), ('103', 'std', 'Available'), ('104', 'std', 'Available'), ('105', 'std', 'Available'),
('106', 'std', 'Available'), ('107', 'std', 'Available'), ('108', 'std', 'Available'), ('109', 'std', 'Available'), ('110', 'std', 'Available'),
('201', 'deluxe', 'Available'), ('202', 'deluxe', 'Available'), ('203', 'deluxe', 'Available'), ('204', 'deluxe', 'Available'), ('205', 'deluxe', 'Available'),
('206', 'deluxe', 'Available'), ('207', 'deluxe', 'Available'), ('208', 'deluxe', 'Available'), ('209', 'deluxe', 'Available'), ('210', 'deluxe', 'Available'),
('301', 'exec', 'Available'), ('302', 'exec', 'Available'), ('303', 'exec', 'Available'), ('304', 'exec', 'Available'), ('305', 'exec', 'Available'),
('306', 'exec', 'Available'), ('307', 'suite', 'Available'), ('308', 'suite', 'Available'), ('309', 'suite', 'Available'), ('310', 'suite', 'Available');
`;

  const directoryTree = `pms-hotel-system/
├── package.json              <-- Project manifest & dev dependencies (Vite + TSX)
├── server.ts                 <-- Full-Stack Node.js backend & API routing proxy gateway
├── tsconfig.json             <-- TypeScript strict compiling adjustments
├── vite.config.ts            <-- Bundler configuration bundling files to '/dist'
├── index.html                <-- HTML5 canvas scaffold mount file
├── src/
│   ├── main.tsx              <-- Mount entrance importing fonts & global styling sheets
│   ├── index.css             <-- Tailwind v4 design imports
│   ├── types.ts              <-- Shared PMS strict TypeScript types (Booking, Room, Guest)
│   ├── data/
│   │   └── initialData.ts    <-- Pre-seeded 30 room layouts, categories, and booking metrics
│   └── components/
│       ├── CustomerHeader.tsx   <-- Customer portal sticky navigation panel
│       ├── CustomerWebsite.tsx  <-- Integrated room explorer & Razorpay card checkout panel
│       ├── BookingLookupPortal.t<-- Search tool retrieving guest room allocations and links
│       ├── ECheckInPortal.tsx   <-- Identity uploads carrying Aadhaar/Passport attachments
│       ├── AdminLogin.tsx       <-- High-contrast staff secure login module
│       ├── DashboardOverview.tsx<-- Executive KPIs & Recharts dynamic graph systems
│       ├── RoomManagement.tsx   <-- Cleaning dispatchers & maintenance locks
│       ├── BookingManagement.tsx<-- Manual bookings & drag allocate rooms dropdowns
│       ├── GuestProfileList.tsx <-- ID Proof card visuals renderer & histories log
│       └── DevDocsViewer.tsx    <-- This documentation browser drawer
`;

  const apiSpecs = `// ==========================================
// PMS SYSTEM BACKEND REST ENDPOINTS ARCHITECTURE
// ==========================================

1. GET  /api/pms/state
   - Retrieves the entire state from 'pms_store.json':
     { rooms, roomTypes, guests, bookings, payments, notifications, documents }

2. POST /api/pms/bookings
   - Creates a booking. Links guest profile (reuses if matches email) and processes mock payment transaction.
   - Triggers automatic "new_booking" and "payment_confirmation" alerts.
   - Body format:
     { guestName, guestEmail, guestPhone, roomTypeId, checkInDate, checkOutDate, numberOfGuests, totalPrice, source, notes, paymentMethod, transactionId }

3. PUT  /api/pms/bookings/:id
   - Updates reservation state (Pending, Confirmed, Checked In, Checked Out, Cancelled).
   - Smart Automations:
     * Status 'Checked In' -> Automatically transitions assigned Room status to 'Occupied'.
     * Status 'Checked Out' -> Automatically transitions Room status to 'Cleaning' for housekeeping dispatches.
     * Status 'Cancelled' -> Reverts room allocation to 'Available' and frees room lock.
   - Body format:
     { status, roomId, paymentStatus }

4. PUT  /api/pms/rooms/:id
   - Handlers update individual room statuses directly (Available, Cleaning, Maintenance, etc.).
   - Body format:
     { status }

5. POST /api/pms/checkin/:id
   - Handles the E-Check-In passport or Aadhaar card upload packet. Registers documents and upgrades Booking to Confirmed.
   - Body format:
     { idType, idNumber, guestName, idProofBase64, idProofName }

6. POST /api/pms/notifications/read
   - Clears all receptionist notifications in the alert tray.
`;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-md p-6 max-w-5xl mx-auto font-sans text-stone-850">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-6">
        <div className="p-2 bg-amber-600 text-white rounded-xl">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">Developer Architecture & Schemas</h2>
          <p className="text-xs text-stone-500">Official technical guides ready for compilation & Supabase migrations</p>
        </div>
      </div>

      {/* Docs Tabs navigation */}
      <div className="flex border-b border-stone-200 mb-6 gap-1 text-xs font-semibold">
        {[
          { id: "sql", label: "Supabase SQL Script", icon: <FileCode className="w-4 h-4" /> },
          { id: "api", label: "API Endpoints Model", icon: <Server className="w-4 h-4" /> },
          { id: "structure", label: "Folder Hierarchy", icon: <Layout className="w-4 h-4 text-emerald-600" /> },
          { id: "deployment", label: "Production Deploy Guide", icon: <Rocket className="w-4 h-4 text-amber-600" /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === t.id
                ? "border-amber-600 text-amber-800"
                : "border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-200"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "sql" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-mono text-stone-400">PostgreSQL DDL schema - Copy to Supabase SQL Editor</span>
              <button
                onClick={() => copyToClipboard(sqlCode, "sql")}
                className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 text-[11px] rounded flex items-center gap-1 font-mono transition-colors"
              >
                {copiedText === "sql" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === "sql" ? "Copied DDL!" : "Copy SQL Code"}
              </button>
            </div>
            <pre className="bg-stone-950 text-emerald-400 rounded-xl p-5 overflow-auto max-h-80 text-[10px] font-mono leading-relaxed">
              {sqlCode}
            </pre>
          </div>
        )}

        {activeTab === "api" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-mono text-stone-400">Express REST Controller endpoints</span>
              <button
                onClick={() => copyToClipboard(apiSpecs, "api")}
                className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 text-[11px] rounded flex items-center gap-1 font-mono transition-colors"
              >
                {copiedText === "api" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === "api" ? "Copied Specs!" : "Copy Specifications"}
              </button>
            </div>
            <pre className="bg-stone-900 text-amber-100 rounded-xl p-5 overflow-auto max-h-80 text-[11px] font-mono leading-relaxed">
              {apiSpecs}
            </pre>
          </div>
        )}

        {activeTab === "structure" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-mono text-stone-400">Vite React + Express workspace structure</span>
              <button
                onClick={() => copyToClipboard(directoryTree, "structure")}
                className="px-3 py-1 bg-stone-900 text-white hover:bg-stone-800 text-[11px] rounded flex items-center gap-1 font-mono transition-colors"
              >
                {copiedText === "structure" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === "structure" ? "Copied Map!" : "Copy Folder Tree"}
              </button>
            </div>
            <pre className="bg-stone-900 text-stone-300 rounded-xl p-5 overflow-auto max-h-80 text-xs font-mono leading-relaxed">
              {directoryTree}
            </pre>
          </div>
        )}

        {activeTab === "deployment" && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-4 text-xs leading-relaxed text-stone-700">
            <h3 className="font-sans font-bold text-base text-stone-900 flex items-center gap-1">
              <Rocket className="w-5 h-5 text-amber-600" /> Production deployment guides
            </h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <strong className="text-stone-900 font-bold block mb-1">Step 1: Set up Supabase cloud schema</strong>
                <p>Register a free SQL database instance on Supabase. Open the SQL Editor and paste the DDL code provided in the "Supabase SQL Script" tab. Run the script to generate all 8 relational tables and pre-populate categories.</p>
              </div>

              <div>
                <strong className="text-stone-900 font-bold block mb-1">Step 2: Connect the React Next.js Environment Variables</strong>
                <p>Add your database environment variables into a `.env.local` or `.env` production file:</p>
                <code className="block bg-stone-100 p-2.5 rounded border border-stone-250 font-mono text-[10px] mt-1.5 leading-normal">
                  NEXT_PUBLIC_SUPABASE_URL=headers.supabase.co<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<br />
                  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<br />
                  RAZORPAY_KEY_ID=rzp_live_...<br />
                  RAZORPAY_KEY_SECRET=...
                </code>
              </div>

              <div>
                <strong className="text-stone-900 font-bold block mb-1">Step 3: Deploying Frontend to Vercel/Render</strong>
                <p>The code is fully compatible with standard platforms. Import your repo into Vercel, attach the environment keys, and Vercel will build and launch your application instantly under secure HTTPS protocol.</p>
              </div>

              <div>
                <strong className="text-stone-900 font-bold block mb-1">Step 4: OTA Integrations and Extensibility</strong>
                <p>The database architecture is built specifically with clean reference splits. Future OTA services (Booking.com, Agoda) can connect to the PMS system simply by writing an Express channel controller API route and updating booking source indicators without needing any relational table migrations!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
