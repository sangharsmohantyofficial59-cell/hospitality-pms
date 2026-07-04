export const STAFF = {
  departments: [
    {
      name: "Front Office",
      roles: [
        {
          role: "General Manager",
          responsibilities: [
            "Overall operations, P&L",
            "Full system access",
          ],
          shift: "General (9–6)",
          reportsTo: "Owner/Corporate",
        },
        {
          role: "Front Office Manager",
          responsibilities: [
            "Check-in/out, guest relations, room assignment",
          ],
          permissions: ["Front desk + reservation module"],
          shift: "Rotational",
          reportsTo: "Resident Manager",
        },
        {
          role: "Reservation Executive",
          responsibilities: ["Booking entry, rate management"],
          permissions: ["Booking module only"],
          shift: "Rotational",
          reportsTo: "Front Office Manager",
        },
        {
          role: "Concierge / Bell Desk",
          responsibilities: ["Luggage, guest requests, travel desk"],
          permissions: ["Front desk (limited)"],
          shift: "Rotational",
          reportsTo: "Front Office Manager",
        },
      ],
    },
    {
      name: "Housekeeping",
      roles: [
        {
          role: "Housekeeping Supervisor",
          responsibilities: ["Room status, cleaning schedule, linen"],
          permissions: ["Housekeeping module"],
          shift: "Morning/Evening",
          reportsTo: "Resident Manager",
        },
      ],
    },
    {
      name: "Finance",
      roles: [
        {
          role: "Night Auditor",
          responsibilities: ["Night audit, revenue reconciliation"],
          permissions: ["Finance + reports (read-only)"],
          shift: "Night (10 PM–7 AM)",
          reportsTo: "Finance Manager",
        },
        {
          role: "Finance Manager",
          responsibilities: ["Billing, GST, city ledger, payroll"],
          permissions: ["Finance module (full)"],
          shift: "General",
          reportsTo: "GM",
        },
      ],
    },
    {
      name: "Engineering",
      roles: [
        {
          role: "Chief Engineer",
          responsibilities: ["Maintenance requests, OOO rooms"],
          permissions: ["Maintenance module"],
          shift: "General",
          reportsTo: "Resident Manager",
        },
      ],
    },
    {
      name: "Food & Beverage",
      roles: [
        {
          role: "F&B Manager",
          responsibilities: ["Restaurant, bar, room service, POS"],
          permissions: ["POS + inventory"],
          shift: "Rotational",
          reportsTo: "Resident Manager",
        },
      ],
    },
    {
      name: "Sales & Marketing",
      roles: [
        {
          role: "Sales & Marketing Manager",
          responsibilities: ["Corporate tie-ups, OTA rates"],
          permissions: ["Rate/channel manager"],
          shift: "General",
          reportsTo: "GM",
        },
      ],
    },
    {
      name: "IT",
      roles: [
        {
          role: "IT Executive",
          responsibilities: ["System uptime, integrations, backups"],
          permissions: ["Admin/superuser"],
          shift: "General/On-call",
          reportsTo: "GM",
        },
      ],
    },
    {
      name: "Security",
      roles: [],
    },
    {
      name: "HR",
      roles: [],
    },
  ],

  hierarchy: ["Owner", "Corporate Office", "General Manager", "Resident Manager", "Department Heads", "Executives", "Associates"],
} as const;

export type StaffConfig = typeof STAFF;

