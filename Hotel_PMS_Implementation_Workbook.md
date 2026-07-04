# Serene Bay Resort & Spa — PMS Implementation & Demo Data Workbook
*(Fictional demo hotel — safe to use for staging, UI mockups, and PMS configuration testing)*

---

## SECTION 1 — HOTEL PROFILE

| Field | Value |
|---|---|
| Hotel Name | Serene Bay Resort & Spa |
| Brand Name | Serene Collection |
| Hotel Group | Serene Hospitality Pvt. Ltd. |
| Address | Plot 14, Marina Beach Road, Sector 9 |
| City | Puri |
| State | Odisha |
| Country | India |
| PIN | 752002 |
| Latitude | 19.8135 |
| Longitude | 85.8312 |
| Phone (Front Desk) | +91-6752-223344 |
| Reservation Number | +91-6752-223355 |
| Email | reservations@serenebayresort.demo |
| Website | www.serenebayresort.demo |
| GSTIN | 21ABCDE1234F1Z5 (demo) |
| PAN | ABCDE1234F (demo) |
| CIN | U55101OR2015PTC012345 (demo) |
| Star Category | 4-Star |
| Hotel Type | Beach Resort / Business & Leisure |
| Year Established | 2015 |
| Number of Rooms | 84 |
| Number of Floors | 6 |
| Number of Buildings | 2 (Main Tower + Garden Wing) |
| Check-in Time | 2:00 PM |
| Check-out Time | 11:00 AM |

---

## SECTION 2 — BRANDING

| Element | Spec |
|---|---|
| Logo | Wordmark + wave icon, SVG + PNG (transparent), min 512×512 |
| Primary Color | `#0B5D6F` (deep teal — ocean) |
| Secondary Color | `#E8A33D` (warm sand gold) |
| Accent/Neutral | `#F7F4EF` (ivory background), `#22303C` (text) |
| Typography | Headings: "Playfair Display"; Body: "Inter" |
| Favicon | 32×32, 180×180 (apple-touch), 512×512 |
| Email Template | Header banner (1200×300), teal CTA buttons, footer with social icons |
| Invoice Header | Logo left, GSTIN/CIN right, hotel address centered |
| Letterhead | Logo top-left, watermark logo center (10% opacity) |
| Watermark | Diagonal, hotel logo, 8–10% opacity, used on printed folios |
| Guest Welcome Screen (in-room TV) | Logo, welcome message, Wi-Fi QR code |
| Digital Signage (lobby) | Rotating banners: offers, events, weather, checkout reminder |

---

## SECTION 3 — ROOM INVENTORY (Sample Rows)

| Room No. | Type | Floor | View | Building | Wing | Status | Max Occ. | Bed Type | Area (sqft) | Smoking | Rate Plan | Housekeeping | Maintenance | Virtual | Connecting |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 101 | Deluxe | 1 | Garden | Main | A | Occupied | 2 | King | 320 | No | BAR | Clean | OK | No | No |
| 102 | Deluxe | 1 | Garden | Main | A | Vacant | 2 | Twin | 320 | No | BAR | Dirty | OK | No | Yes (103) |
| 205 | Premium Sea View | 2 | Sea | Main | B | Occupied | 3 | King | 400 | No | Corporate | Clean | OK | No | No |
| 310 | Executive Suite | 3 | Sea | Main | B | Vacant | 4 | King+Sofa | 650 | No | Package | Inspected | OK | No | No |
| 401 | Family Room | 4 | Garden | Garden Wing | C | Blocked | 5 | 2 Queen | 550 | No | Seasonal | Dirty | Under Repair | No | Yes (402) |
| 501 | Presidential Suite | 5 | Sea | Main | B | Vacant | 4 | King | 900 | No | BAR | Clean | OK | Yes | No |

*(Full inventory: 84 rows generated on the same pattern — happy to export as CSV/Excel if useful.)*

---

## SECTION 4 — ROOM TYPES

| Room Type | Base Rate (₹) | Weekend Rate | Season Rate (Peak) | Extra Adult | Extra Child | Occupancy (Base/Max) | Bed Size | Meal Plan Options |
|---|---|---|---|---|---|---|---|---|
| Deluxe Room | 4,500 | 5,200 | 6,800 | 1,200 | 700 | 2 / 3 | King/Twin | EP, CP, MAP |
| Premium Sea View | 6,200 | 7,000 | 9,500 | 1,500 | 900 | 2 / 3 | King | CP, MAP, AP |
| Executive Suite | 9,800 | 11,000 | 14,500 | 1,800 | 1,000 | 2 / 4 | King + Sofa | MAP, AP |
| Family Room | 7,500 | 8,500 | 10,500 | 1,500 | 800 | 4 / 5 | 2 Queen | CP, MAP |
| Presidential Suite | 18,000 | 21,000 | 27,000 | 2,500 | 1,200 | 2 / 4 | King | AP (all-inclusive) |

**Common fields per type:** Breakfast (included/optional), Amenities (Wi-Fi, minibar, safe, AC, smart TV, rain shower), Cancellation Policy (free up to 24/48/72 hrs before check-in depending on rate), Images (min 5 per room type: bed, bathroom, view, seating, amenities), Description (60–120 words), Policies (pet policy, extra bed, smoking).

---

## SECTION 5 — RATE PLANS

| Rate Plan | Description | Typical Discount/Markup |
|---|---|---|
| BAR (Best Available Rate) | Flexible, fully refundable | Base |
| Corporate | Negotiated rate for tie-up companies | -10% to -15% |
| Government | GST-exempt/discounted for govt employees | -15% |
| Travel Agent (Net Rate) | Commissionable, non-published | -18% to -20% |
| Weekend Special | Fri–Sun premium | +10% to +15% |
| Seasonal (Peak) | Oct–Feb (beach season) | +25% to +40% |
| Festival Package | Rath Yatra, Diwali, New Year | +40% to +60% |
| Package Rate | Room + meals + spa/sightseeing bundled | Custom |
| Long Stay | 7+ nights | -15% to -25% |
| Hourly/Day-Use | 3–6 hr blocks | 30–50% of nightly rate |

---

## SECTION 6 — HOTEL FACILITIES

Restaurant (multi-cuisine) · Rooftop Bar · Outdoor Pool + Kids' Pool · Ocean Spa & Wellness Center · 24-hr Gym · Conference Hall (200 pax) · Business Center · Kids' Play Area · Valet & Self Parking · EV Charging (2 points) · Airport Pickup/Drop · Travel Desk · Same-day Laundry · Banquet Hall (500 pax) · Wedding Lawn (beachside) · Local Temple Tour Desk (Jagannath Temple) · 24-hr Taxi Desk · On-call Doctor · Currency Exchange Counter.

---

## SECTION 7 — STAFF STRUCTURE

**Hierarchy:** Owner → Corporate Office → General Manager → Resident Manager → Department Heads (Front Office, Reservations, Housekeeping, F&B, Engineering, Finance, HR, Sales & Marketing, Security, IT) → Executives → Associates.

| Role | Key Responsibilities | Permissions | Shift | Reports To |
|---|---|---|---|---|
| General Manager | Overall operations, P&L | Full system access | General (9–6) | Owner/Corporate |
| Front Office Manager | Check-in/out, guest relations, room assignment | Front desk + reservation module | Rotational | Resident Manager |
| Reservation Executive | Booking entry, rate management | Booking module only | Rotational | Front Office Manager |
| Housekeeping Supervisor | Room status, cleaning schedule, linen | Housekeeping module | Morning/Evening | Resident Manager |
| Night Auditor | Night audit, revenue reconciliation | Finance + reports (read-only) | Night (10 PM–7 AM) | Finance Manager |
| Chief Engineer | Maintenance requests, OOO rooms | Maintenance module | General | Resident Manager |
| F&B Manager | Restaurant, bar, room service, POS | POS + inventory | Rotational | Resident Manager |
| Finance Manager | Billing, GST, city ledger, payroll | Finance module (full) | General | GM |
| Sales & Marketing Manager | Corporate tie-ups, OTA rates | Rate/channel manager | General | GM |
| IT Executive | System uptime, integrations, backups | Admin/superuser | General/On-call | GM |
| Concierge / Bell Desk | Luggage, guest requests, travel desk | Front desk (limited) | Rotational | Front Office Manager |

---

## SECTION 8 — OPERATING POLICIES

- **Cancellation:** Free cancellation up to 48 hrs before check-in (BAR); non-refundable for advance-purchase rates.
- **Refund:** Processed within 5–7 business days to original payment method.
- **No-Show:** First night charged in full.
- **Early Check-in:** Subject to availability; free before 8 AM otherwise 50% of nightly rate.
- **Late Checkout:** Free till 1 PM; 50% charge till 4 PM; full night charge after.
- **Extra Bed:** As per Room Type table above; max 1 extra bed/room.
- **Child Policy:** Below 5 yrs free (no extra bed); 5–12 yrs extra child charge applies.
- **Pet Policy:** Not allowed except service animals.
- **Smoking:** Designated balconies/outdoor areas only; ₹5,000 cleaning fee for violation.
- **Visitor Policy:** Visitors allowed till 9 PM with ID registration at front desk.
- **Parking:** Complimentary for in-house guests.
- **GST:** 12% (<₹7,500/night), 18% (≥₹7,500/night) — per current Indian slab (verify current rate at implementation).
- **Luxury Tax:** As applicable per Odisha state tax rules.
- **Service Charge:** Optional, restaurant only.
- **Lost & Found:** Items held 90 days, logged with photo + description.
- **Damage Policy:** Charged as per replacement/repair cost, billed to folio.

---

## SECTION 9 — RESTAURANT & F&B

- **Outlets:** "Tidewater" Multi-cuisine Restaurant, "Anchor" Rooftop Bar, Pool Snack Bar, In-room Dining.
- **Kitchen:** Main kitchen + banquet kitchen, HACCP-compliant.
- **POS:** Integrated with PMS for room-charge posting.
- **Menu Types:** À la carte, Buffet Breakfast (7–10:30 AM), Lunch (12:30–3 PM), Dinner (7:30–11 PM).
- **Bar:** Full bar + Happy Hours 6–8 PM (20% off).
- **Mini Bar:** In-room, restocked daily, auto-billed on consumption.
- **Room Service:** 24-hr, delivery SLA 30 min.
- **Coupons/Discounts:** Loyalty members 10% off dining; combo meal deals.

---

## SECTION 10 — FINANCE

GST-compliant invoicing · Receipts (cash/card/UPI/bank transfer) · Refund processing · Corporate billing (credit accounts) · City Ledger for travel agents/companies · Advance/Deposit collection at booking · Applicable taxes (GST, luxury tax as per state) · Night Audit (daily revenue reconciliation, currency/room-status lock) · Revenue Centers (Rooms, F&B, Spa, Banquet, Laundry, Miscellaneous).

---

## SECTION 11 — HOUSEKEEPING WORKFLOW

**Room Status Cycle:** Dirty → Cleaning In Progress → Clean → Inspected → Vacant Ready.
**Other Statuses:** Occupied, Out of Order (OOO — maintenance), Out of Service (OOS — temporarily unusable), Do Not Disturb.
**Supporting Processes:** Linen/laundry cycle tracking, Lost & Found logging, Maintenance request ticketing (linked to Engineering), Daily housekeeping checklist per room.

---

## SECTION 12 — GUEST JOURNEY

1. **Discovery/Booking** (website, OTA, phone, walk-in)
2. **Reservation Confirmation** (email/SMS with booking ID)
3. **Pre-arrival** (reminder, upsell offers)
4. **Arrival & Reception**
5. **Check-in** (ID verification, payment/advance, room assignment, key issuance)
6. **Stay** (housekeeping service, restaurant, facility usage, complaint handling, maintenance if needed)
7. **Checkout** (folio review, invoice generation, payment settlement)
8. **Post-stay** (feedback request, loyalty points credit, marketing follow-up)

---

## SECTION 13 — DOCUMENTS

Guest Registration Form (C-Form for foreign nationals) · ID Proof (Aadhaar/Passport/Driving License/Voter ID) · Visa copy (foreign guests) · Tax Invoice · Payment Receipt · POS Bill · Laundry Bill · Guest Feedback Form · Travel Desk Voucher · Maintenance Ticket · Housekeeping Checklist · Banquet/Event Contract.

---

## SECTION 14 — REPORTS

Daily Arrival Report · Departure Report · Occupancy Report · ADR (Average Daily Rate) · RevPAR · Revenue Summary · Night Audit Report · Cashier Shift Report · Housekeeping Status Report · Maintenance Log · Restaurant Sales Report · Sales/Marketing Report · Tax Summary (GST) · Corporate Account Statement · Travel Agent Commission Report · Channel Manager Performance Report · Demand Forecast Report.

---

## SECTION 15 — INTEGRATIONS

Payment Gateway (Razorpay/Stripe demo mode) · Door Lock System (RFID, e.g., Assa Abloy/Onity — API sample) · Channel Manager (e.g., SiteMinder/RateGain) · OTAs: Booking.com, Agoda, Airbnb, Expedia, Google Hotel Ads · WhatsApp Business API (booking confirmations) · Email (SMTP/SendGrid) · SMS Gateway · Biometric Attendance (staff) · Accounting Software (Tally/QuickBooks) · CRM for guest loyalty & marketing.

---

## SECTION 16 — MASTER DATA TABLES

Hotels · Room Types · Rooms · Rate Plans · Rate Calendar · Guests · Companies/Travel Agents · Bookings/Reservations · Folios · Payments · Taxes · Discounts/Coupons · Facilities · Staff/Users · Roles & Permissions · Departments · Shifts · Housekeeping Status Log · Maintenance Tickets · Restaurant Menu Items · POS Transactions · Inventory Items · Vendors · Currency · Countries/States/Cities · Document Types · Loyalty Tiers · Feedback/Reviews.

---

## SECTION 17 — IMPLEMENTATION CHECKLIST (Pre Go-Live)

- [ ] Hotel profile & legal details entered (GST, PAN, CIN)
- [ ] Branding assets uploaded (logo, colors, fonts, templates)
- [ ] Room inventory created (all 84 rooms)
- [ ] Room types & rate plans configured
- [ ] Tax rules configured per current GST slabs
- [ ] Staff accounts created with role-based permissions
- [ ] Facilities & amenities listed
- [ ] Restaurant/POS setup and menu loaded
- [ ] Payment gateway sandbox connected
- [ ] Channel manager / OTA test connections verified
- [ ] Email/SMS/WhatsApp templates configured
- [ ] Sample bookings tested end-to-end (booking → check-in → checkout → invoice)
- [ ] Reports validated against sample data
- [ ] Staff training completed

---

## SECTION 18 — GO-LIVE CHECKLIST

- [ ] Production database separated from staging/demo data
- [ ] SSL certificate active on live domain
- [ ] Live payment gateway keys switched (from sandbox)
- [ ] Real room inventory & rates loaded (replacing demo data)
- [ ] OTA rate parity verified
- [ ] Backup schedule confirmed (daily automated backup)
- [ ] Night audit process tested on live data
- [ ] Support contact/escalation matrix shared with staff
- [ ] Rollback plan documented

---

## SECTION 19 — POST GO-LIVE SUPPORT CHECKLIST

- [ ] Daily system uptime monitoring
- [ ] Weekly database backup verification
- [ ] Monthly reconciliation of PMS vs. accounting
- [ ] Ticketing system for bug reports/feature requests
- [ ] Quarterly security & access review
- [ ] Staff refresher training every 6 months
- [ ] Channel manager/OTA sync health checks (daily)
- [ ] Guest feedback review cadence (weekly)

---

*This is fully synthetic demo content ("Serene Bay Resort & Spa" is fictional) intended for staging/demo builds only — swap in real hotel details before any production go-live.*
