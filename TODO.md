# Sprint 5.1 - Ticket B (Revised) - Prisma booking creation migration

## Plan & Implementation Steps

1. Create Prisma Client helper (server-only) and wire it into server.ts.
   - Ensure it uses existing prisma/schema.prisma and prisma.config.ts approach.
   - Add DATABASE_URL support via env.

2. Add migrated Prisma persistence for ONLY booking creation endpoint:
   - Locate `app.post("/api/pms/bookings"...)` handler in server.ts.
   - Replace `guests/bookings.push(...)` persistence for the new booking with Prisma writes.
   - Keep all other arrays (rooms/payments/notifications/etc.) and JSON persistence untouched.

3. Preserve legacy API response format:
   - The endpoint must still respond with `{ success: true, booking: newBooking, guest }` shape.
   - `newBooking` must remain identical to current in-memory structure.

4. Implement Prisma mapping:
   - Map request payload → `Tenant/Hotel` assumptions consistent with existing project.
   - Ensure Booking + Guest upsert/creates in Prisma.
   - Do not migrate room assignment/check-in/check-out/payments.

5. Add defensive fallback behavior:
   - If Prisma fails, return 500 with legacy error shape (or keep current error handling) without breaking other endpoints.

6. Add comments identifying migrated code regions.

7. Run TypeScript check + quick server compile check.

## Migration progress tracking
- [ ] Step 1: Prisma Client helper created
- [ ] Step 2: server.ts booking create endpoint migrated
- [ ] Step 3: Legacy response format preserved
- [ ] Step 4: Prisma mapping implemented
- [ ] Step 5: Fallback/defensive behavior
- [ ] Step 6: Migration comments added
- [ ] Step 7: tsc / start build verified

