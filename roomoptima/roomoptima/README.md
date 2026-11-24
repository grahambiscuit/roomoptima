# RoomOptima

Predictive room allocation and intelligent scheduling for Gordon College, College of Computer Studies.
BSCS 3-C · Team Falcons Philippines

A front-end website with sample data. No build step and no server needed: open `index.html` in a browser.

## Sample accounts

These are not shown on the sign-in page. Use them to try each role.

| Role | Email | Password |
| --- | --- | --- |
| Student | marc.bunan@gordoncollege.edu.ph | Student@123 |
| Administrator | john.lopez@gordoncollege.edu.ph | Admin@1234 |

## Project structure

```
roomoptima/
├── index.html            Page markup: landing page, login screen, app shell, modal roots
├── assets/
│   └── seal.png          Gordon College seal
├── css/
│   ├── tokens.css        Colours, fonts, light and dark palettes
│   ├── base.css          Reset and typography
│   ├── components.css    Buttons, badges, fields, cards, tables, modals, toasts
│   ├── layout.css        Login screen, sidebar, top bar
│   ├── landing.css       Landing page
│   ├── pages.css         Rooms, schedule grid, recommendations, profile
│   └── responsive.css    Breakpoints and reduced motion
└── js/
    ├── utils.js          DOM and date/time helpers
    ├── config.js         Equipment, buildings, floors, time slots, icons
    ├── store.js          Data layer: sample data, storage, lookups
    ├── ui.js             UI state, HTML builders, modals, toasts
    ├── forms.js          Inline validation engine and shared validators
    ├── policy.js         Terms and Room Use Policy text
    ├── auth.js           Sign in, sign out, switching between landing, login and app
    ├── router.js         Hash routing and sidebar
    ├── pages/
    │   ├── dashboard.js  Administrator and student dashboards
    │   ├── rooms.js      Rooms, room details, add/edit room
    │   ├── bookings.js   Bookings, booking dialog, cancellation dialog
    │   ├── schedule.js   Schedule grid
    │   ├── recommend.js  Smart recommendation
    │   ├── settings.js   Admin settings and bulk actions
    │   └── profile.js    Profile and login information
    ├── landing.js        Landing page: today's room board, rules, buildings
    ├── actions.js        Submit handlers and click actions
    └── main.js           Start-up
```

Scripts are plain files loaded in order by `index.html` (see the `<script>` list at the bottom). They share one scope, so the order matters: `utils`, `config`, `store`, `ui`, `forms`, then everything else, and `main.js` last.

## How the 12 revisions are covered

| Revision | Where |
| --- | --- |
| Input validation, bad validation | `js/forms.js` and the validators in each page file; errors show under the field |
| Dates (start and end) | Booking dialog in `js/pages/bookings.js` |
| Terms and conditions, policies | `js/policy.js`; checkbox on Login, New Booking and Cancel Booking |
| Identity of Gordon College | Seal, college name and CCS line in `index.html` |
| Proper naming convention | `nameErr` in `js/forms.js` (Last Name, First Name M.I.); "Room 301" labels |
| Location and room details | Detail panel and floor map in `js/pages/rooms.js` |
| Profile and login info | `js/pages/profile.js` |
| Equipment dropdown | Multi-select in the room dialog; filters on Rooms and Smart Recommend |
| Room number: not everything | Digits only, 2 to 4 long, unique (`js/pages/rooms.js`) |
| Limit capacity | Group size must not exceed the room capacity (`js/pages/bookings.js`) |
| Modal cancellation | `openCancel` in `js/pages/bookings.js`; all dialogs close with ✕, Cancel, Esc or a click outside |

## Data

Data is saved in the browser (`localStorage`) so changes survive a refresh. It is not shared between devices. All data access is in `js/store.js`.

The policy text in `js/policy.js` and the building names in `js/config.js` are samples. Replace them with the college's real details.
