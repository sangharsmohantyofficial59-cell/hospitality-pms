# TODO - Phase A (Blocking fixes)

## Phase A scope
Edit only these files:
1) `src/services/notificationService.ts`
2) `src/components/MessageTemplates.tsx`
3) `src/components/CustomerWebsite.tsx` (Contact section only)

Forbidden strings to remove in those files:
- Grand Crest
- Grand Crest Hotel
- Grand Crest Kolkata
- Niladri
- BK-NILADRI

## Steps
- [ ] 1. Update `src/services/notificationService.ts` to remove all Grand Crest/Niladri/BK-NILADRI branding and use `hotelConfig`/`BRANDING`/`HOTEL` values.
- [ ] 2. Update `src/components/MessageTemplates.tsx` to remove Niladri/BK-NILADRI and niladri-resorts.com URLs; replace with `hotelConfig`/`BRANDING`.
- [ ] 3. Update `src/components/CustomerWebsite.tsx` contact tab only to remove Niladri branding and hardcoded contact identity; use `hotelConfig`/`BRANDING`.
- [ ] 4. Run `npm run build`.
- [ ] 5. Run a Windows `findstr` search on the three edited files for forbidden strings; ensure zero matches.
- [ ] 6. Report files modified, build result, search result.

