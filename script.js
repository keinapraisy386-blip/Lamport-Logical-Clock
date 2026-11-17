const $ = (id) => document.getElementById(id);

let processes = [];
let events = [];
let messages = [];
let nextMessageId = 1;

function initProcesses(count = 3) {
  processes = Array.from({ length: count }, (_, i) => ({ id: i + 1, clock: 0, eventCount: 0 }));
  events = [];
  messages = [];
  nextMessageId = 1;
  renderAll();
  feedback("Simulation reset. All logical clocks are set to 0.");
}

function processName(id) { return `P${id}`; }

function addEvent(processId, type, details, timestamp) {
  const process = processes.find(p => p.id === Number(processId));
  process.eventCount += 1;
  events.push({
    number: events.length + 1,
    processId: Number(processId),
    type,
    details,
    timestamp,
    eventNumber: process.eventCount
  });
}

function localEvent() {
  const id = Number($("sourceProcess").value);
  const process = processes.find(p => p.id === id);
  process.clock += 1;
  addEvent(id, "Local", "Internal event", process.clock);
  feedback(`${processName(id)} performed a local event. Clock incremented to ${process.clock}.`);
  renderAll();
}

function sendMessage() {
  const from = Number($("sourceProcess").value);
  const to = Number($("targetProcess").value);
  if (from === to) {
    feedback("Choose a different destination process.");
    return;
  }
  const process = processes.find(p => p.id === from);
  process.clock += 1;
  const message = { id: nextMessageId++, from, to, timestamp: process.clock };
  messages.push(message);
  addEvent(from, "Send", `Message M${message.id} sent to ${processName(to)}`, process.clock);
  feedback(`${processName(from)} sent M${message.id} to ${processName(to)} with timestamp ${process.clock}.`);
  renderAll();
}

function receiveMessage() {
  const messageId = Number($("messageSelect").value);
  const message = messages.find(m => m.id === messageId);
  if (!message) {
    feedback("There is no pending message to receive.");
    return;
  }
  const receiver = processes.find(p => p.id === message.to);
  receiver.clock = Math.max(receiver.clock, message.timestamp) + 1;
  addEvent(receiver.id, "Receive", `Message M${message.id} received from ${processName(message.from)} (sent at ${message.timestamp})`, receiver.clock);
  messages = messages.filter(m => m.id !== message.id);
  feedback(`${processName(receiver.id)} received M${message.id}. Clock = max(current, ${message.timestamp}) + 1 = ${receiver.clock}.`);
  $("sourceProcess").value = String(receiver.id);
  renderAll();
}

function renderProcesses() {
  $("processes").innerHTML = processes.map(p => `
    <article class="process-card">
      <div class="process-head"><span class="process-name">${processName(p.id)}</span><span class="process-tag">ACTIVE</span></div>
      <div class="clock-label">LOGICAL CLOCK</div>
      <div class="clock-value">${p.clock}</div>
      <div class="process-events">${p.eventCount} event${p.eventCount === 1 ? "" : "s"} recorded</div>
    </article>`).join("");
}

function renderSelectors() {
  const options = processes.map(p => `<option value="${p.id}">${processName(p.id)}</option>`).join("");
  const oldSource = Number($("sourceProcess").value) || 1;
  const oldTarget = Number($("targetProcess").value) || (processes.length > 1 ? 2 : 1);
  $("sourceProcess").innerHTML = options;
  $("targetProcess").innerHTML = options;
  $("sourceProcess").value = String(Math.min(oldSource, processes.length));
  let target = Math.min(oldTarget, processes.length);
  if (target === Number($("sourceProcess").value) && processes.length > 1) target = target % processes.length + 1;
  $("targetProcess").value = String(target);
}

function renderHistory() {
  const body = $("eventHistory");
  if (!events.length) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">No events yet. Add a local event or send a message to begin.</td></tr>';
    return;
  }
  body.innerHTML = events.map(e => {
    const typeClass = e.type.toLowerCase();
    return `<tr>
      <td>${String(e.number).padStart(2, "0")}</td>
      <td><strong>${processName(e.processId)}</strong></td>
      <td><span class="event-pill pill-${typeClass}">${e.type}</span></td>
      <td>${escapeHtml(e.details)}</td>
      <td><span class="timestamp">${e.timestamp}</span></td>
    </tr>`;
  }).join("");
}

function renderMessages() {
  $("messageSelect").innerHTML = messages.length
    ? messages.map(m => `<option value="${m.id}">M${m.id}: ${processName(m.from)} → ${processName(m.to)} (t=${m.timestamp})</option>`).join("")
    : '<option value="">No pending messages</option>';
  $("receiveBtn").disabled = messages.length === 0;
  $("receiveBtn").style.opacity = messages.length === 0 ? ".55" : "1";
  $("messageList").innerHTML = messages.length
    ? messages.map(m => `<div class="message-item"><strong>M${m.id} · ${processName(m.from)} → ${processName(m.to)}</strong><p>In transit · sent with timestamp <span class="message-time">${m.timestamp}</span></p></div>`).join("")
    : '<p class="empty-message">No messages are currently in transit.</p>';
}

function renderAll() {
  renderProcesses();
  renderSelectors();
  renderHistory();
  renderMessages();
}

function feedback(message) { $("actionFeedback").textContent = message; }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

$("localBtn").addEventListener("click", localEvent);
$("sendBtn").addEventListener("click", sendMessage);
$("receiveBtn").addEventListener("click", receiveMessage);
$("applyProcesses").addEventListener("click", () => {
  initProcesses(Number($("processCount").value));
});
$("resetBtn").addEventListener("click", () => initProcesses(processes.length));

initProcesses(3);
