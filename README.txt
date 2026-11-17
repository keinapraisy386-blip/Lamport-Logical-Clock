# Lamport Logical Clock Simulator

A frontend-only educational simulator for the CS3551 Distributed Computing assignment.

## Files
- `index.html` — page structure and controls
- `style.css` — responsive interface styling
- `script.js` — process clocks, message passing, and event history

## How to run
1. Extract the ZIP file.
2. Open the `lamport-logical-clock-simulator` folder.
3. Double-click `index.html` to open it in a modern browser.

No installation, backend, database, or server is required.

## How to use
1. Select 2, 3, or 4 processes and click **Apply**.
2. Select a source process.
3. Choose **Local event** to increment its logical clock.
4. Choose a different destination and click **Send message**.
5. Select the pending message and click **Receive message**.
6. Review the event history and message queue.

## Lamport clock rules implemented
- Local event: `C = C + 1`
- Send event: `C = C + 1`; attach the updated timestamp to the message.
- Receive event: `C = max(C, message timestamp) + 1`

This is a simulation: processes are represented in the browser and messages are kept in an in-memory queue. Refreshing the page resets the simulation.
