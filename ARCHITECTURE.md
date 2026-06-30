# PMS Backend Architecture

## Folder Structure

server/
    services/

## Service Responsibilities

### ActivityLogService
- Centralizes activity log creation.
- Generates structured audit entries with timestamp, user, action, details, and icon.
- Keeps logging logic out of route handlers.

### GuestService
- Encapsulates guest lookup, creation, update, and validation.
- Handles find-or-create guest semantics by email.
- Ensures guest payload validation is consistent across booking flows.

### RoomService
- Centralizes room availability, assignment, release, and conflict detection.
- Encapsulates room status updates and occupancy calculations.
- Keeps room-related business rules out of booking and admin routes.

### BookingService
- Encapsulates booking creation orchestration.
- Validates booking dates and guest payloads.
- Performs room availability checks using RoomService.
- Handles booking object construction and reservation activity logging.

### PaymentService
- Centralizes reusable payment calculations and validation.
- Computes GST and discount adjustments.
- Computes pending balance and advance payment values.
- Provides a payment summary helper for consistent payment behavior.

## Current Persistence

- Primary persistence is legacy JSON via `pms_store.json`.
- Partial Prisma migration exists for booking creation, but JSON remains the current source of truth.

## Current Architecture Flow

Booking Route
↓
BookingService
↓
GuestService
↓
RoomService
↓
PaymentService
↓
ActivityLogService

## Technical Debt

- Partial Prisma migration is incomplete; JSON persistence remains active.
- Backend still contains legacy reconciliation and transport ledger logic in routes.
- Full project TypeScript build is impacted by third-party type config issues (Twilio / node module interop).
- Routes are still monolithic in `server.ts` and should be modularized in Sprint 6.

## Sprint 6 Roadmap

- Portal Separation
- Route Modularization
- Responsive Optimization
- Performance Optimization
