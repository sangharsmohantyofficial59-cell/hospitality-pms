# Inventory Migration TODO (Room Inventory Migration Only)

- [x] Update `src/config/hotel/rooms.ts` to generate 50 rooms (10 per roomType) using `src/config/hotel/roomTypes.ts` roomType ids only.

- [ ] Ensure there is **no** Niladri inventory: remove old demo room numbers that don’t match the new generator.
- [ ] Ensure every generated room has `roomTypeId` referencing one of the ids from `ROOM_TYPES`.
- [ ] Keep all room fields required by the app (roomNo/id, status, etc.) consistent with existing `RoomService` usage.
- [ ] Run a quick node check (or server start) to verify `GET /api/pms/state` returns 50 rooms.
- [ ] Verify booking engine allocation works by checking overlap/conflict logic against the new room inventory.

