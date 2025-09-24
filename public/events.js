async function fetchEvents() {
  const q = document.getElementById("search").value.trim();
  const type = document.getElementById("type").value;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  params.set("limit", "200");
  const res = await fetch(`/events?${params.toString()}`);
  const data = await res.json();
  return data.items || [];
}

function badge(type) {
  const span = document.createElement("span");
  span.className = "badge " + (type === "conversation-init" ? "init" : "end");
  span.textContent = type;
  return span;
}

async function replay(id) {
  const btn = document.querySelector(`button[data-id="${id}"]`);
  btn.disabled = true;
  btn.textContent = "Replaying…";
  try {
    const res = await fetch(`/events/replay/${encodeURIComponent(id)}`, { method: "POST" });
    const data = await res.json();
    btn.textContent = data.ok ? "Replayed" : "Failed";
  } catch {
    btn.textContent = "Error";
  } finally {
    setTimeout(() => { btn.disabled = false; btn.textContent = "Replay"; }, 1200);
  }
}

async function render() {
  const tbody = document.querySelector("#tbl tbody");
  tbody.innerHTML = "";
  const items = await fetchEvents();
  for (const e of items) {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td"); tdId.textContent = e.id;
    const tdType = document.createElement("td"); tdType.appendChild(badge(e.type));
    const tdTs = document.createElement("td"); tdTs.textContent = e.ts;
    const tdPath = document.createElement("td"); tdPath.textContent = e.path;
    const tdBody = document.createElement("td"); tdBody.textContent = e.body_preview || "";
    const tdReplay = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "replay-btn";
    btn.textContent = "Replay";
    btn.dataset.id = e.id;
    btn.onclick = () => replay(e.id);
    tdReplay.appendChild(btn);

    tr.append(tdId, tdType, tdTs, tdPath, tdBody, tdReplay);
    tbody.appendChild(tr);
  }
}

document.getElementById("refresh").onclick = render;
document.getElementById("search").oninput = () => { clearTimeout(window.__t); window.__t = setTimeout(render, 250); };
document.getElementById("type").onchange = render;

// auto-refresh every 10s
setInterval(render, 10000);
render();