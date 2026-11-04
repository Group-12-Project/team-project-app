# GradPath

A Graduate Student Pathway app with a Node.js command-line planner and a browser demo based on the [GradPath Figma web prototype](https://www.figma.com/design/UdKLxRySUFayJww0xsZJWR/?node-id=4-469).

## Run

```sh
npm install
npm run web
```

Open http://localhost:3000. Enter any valid email and a nonempty password to enter the demo. The server binds to localhost; use `PORT=3001 npm run web` to choose another port.

The existing command-line app remains available:

```sh
npm start -- --completed GRA-501,GRA-530 --credits 9
npm test
```

## Implemented design flows

- Welcome/login, account creation with password confirmation, and password-reset demo.
- Home dashboard and responsive application navigation.
- Profile viewing/editing and success notice.
- Preferences editing/saving and success notice.
- Schedule: weekly plan, planned credits, and remove-class confirmation.
- Course ratings: ratings list and search, class ratings, write a review, and review posted.
- Career Readiness: hub, clubs, skills, internships, opportunity details, saved next steps, completed steps, and interview practice.
- Classes: browse, search by title or skill, the technical-skills filter, class detail, add-to-plan, class-added confirmation, and schedule-conflict warning.
- Logout confirmation.

This is a frontend demo, not an authentication system. Credentials are never transmitted or persisted. A tab-local session enables demo navigation. Profile, preferences, and the planned classes are stored in localStorage on this device. Degree progress and class eligibility are sample data from Figma, not verified academic records. Password reset explicitly reports that no email was sent. Adding a class does not enroll the student.

## Remaining design work

Figma's Starter-plan tool limit prevented retrieving high-fidelity design context for profile setup, role selection, and administration. These sections are intentionally marked unavailable rather than represented as completed. The linked page contains 47 frames/states; this implementation covers the design context that was successfully retrieved. Mobile layouts adapt the web design; the separate mobile prototype has not been inspected.

The codebase contained no existing UI components or design library. The implementation shares native HTML form/button/card primitives and CSS tokens using the Figma colors, spacing, and typography sizes. Retrieved screens contained no static image or SVG assets. Inter is requested with Arial as a fallback; no font file was supplied or bundled.

## Verification

`npm test` covers the original planner plus static-file serving, demo navigation, password confirmation, profile escaping/persistence, preferences, and course-add state. `node --check public/app.js` checks browser JavaScript syntax. Browser screenshot comparison could not run because the browser access host was unavailable.
