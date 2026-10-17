/* Hamiltonian Cycle – algorithm, graph rendering and UI (vanilla JS) */
const LABELS = "ABCDEFGHIJ";
const MAX_N = 10;

/* ---------- Core algorithm (pure, no DOM) ---------- */
// Backtracking search. adj = n×n 0/1 matrix. Returns {cycle:[...]|null, steps}.
function findHamiltonianCycle(adj) {
  const n = adj.length, path = [0], visited = Array(n).fill(false);
  let steps = 0;
  visited[0] = true;
  function solve(pos) {
    if (pos === n) return adj[path[n - 1]][0] === 1;       // close the cycle?
    for (let v = 1; v < n; v++) {
      steps++;
      if (!visited[v] && adj[path[pos - 1]][v] === 1) {
        path[pos] = v; visited[v] = true;
        if (solve(pos + 1)) return true;
        visited[v] = false; path.length = pos;              // backtrack
      }
    }
    return false;
  }
  const found = n >= 3 && solve(1);
  return { cycle: found ? [...path, 0] : null, steps };
}

// Parse + validate matrix text. Returns {adj} or {error}.
function parseMatrix(text) {
  const rows = text.trim().split(/\r?\n/).map(r => r.trim()).filter(r => r);
  const n = rows.length;
  if (n < 3) return { error: "Enter at least 3 rows (a graph needs 3+ vertices)." };
  if (n > MAX_N) return { error: `Maximum ${MAX_N} vertices allowed (the algorithm is O(n!)).` };
  const adj = [];
  for (let i = 0; i < n; i++) {
    const cells = rows[i].split(/[\s,]+/);
    if (cells.length !== n) return { error: `Row ${i + 1} has ${cells.length} values but ${n} are expected (matrix must be square).` };
    if (cells.some(c => c !== "0" && c !== "1")) return { error: `Row ${i + 1} contains a value other than 0 or 1.` };
    adj.push(cells.map(Number));
  }
  for (let i = 0; i < n; i++) {
    if (adj[i][i] !== 0) return { error: `Diagonal entry (${LABELS[i]},${LABELS[i]}) must be 0 (no self-loops).` };
    for (let j = i + 1; j < n; j++)
      if (adj[i][j] !== adj[j][i]) return { error: `Matrix must be symmetric: entry (${LABELS[i]},${LABELS[j]}) differs from (${LABELS[j]},${LABELS[i]}).` };
  }
  return { adj };
}

/* ---------- Helpers ---------- */
function fromEdges(n, edges) {
  const a = Array.from({ length: n }, () => Array(n).fill(0));
  edges.forEach(([u, v]) => { a[u][v] = a[v][u] = 1; });
  return a;
}
const matrixToText = adj => adj.map(r => r.join(" ")).join("\n");
const cycleToText = c => c.map(i => LABELS[i]).join(" → ");

const PRESETS = {
  "Graph 1 – Has a cycle (5 vertices)": fromEdges(5, [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]]),
  "Graph 2 – No cycle (5 vertices)": fromEdges(5, [[0,1],[0,2],[0,3],[0,4],[1,2]]),
  "Graph 3 – Has a cycle (6 vertices)": fromEdges(6, [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]]),
  "Graph 4 – Path only, no cycle": fromEdges(4, [[0,1],[1,2],[2,3],[0,2]])
};

/* ---------- SVG rendering ---------- */
const NS = "http://www.w3.org/2000/svg";
function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

// Draws the graph; cycle = array of vertex indices (closed) or null; onNode = click callback.
function drawGraph(svg, adj, cycle, selected, onNode) {
  svg.innerHTML = "";
  const n = adj.length, cx = 250, cy = 210, r = 160;
  const pos = adj.map((_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const cycEdges = new Map();                     // "u-v" -> order index
  if (cycle) for (let k = 0; k < cycle.length - 1; k++) {
    const u = cycle[k], v = cycle[k + 1];
    cycEdges.set(Math.min(u, v) + "-" + Math.max(u, v), k);
  }
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (adj[i][j]) {
    const k = cycEdges.get(i + "-" + j);
    const line = el("line", { x1: pos[i][0], y1: pos[i][1], x2: pos[j][0], y2: pos[j][1], pathLength: 1,
      class: "edge" + (k !== undefined ? " hl" : "") }, svg);
    if (k !== undefined) line.style.animationDelay = (k * 0.25) + "s";
  }
  for (let i = 0; i < n; i++) {
    const g = el("g", { class: "node" + (cycle ? " hl" : "") + (selected === i ? " sel" : "") }, svg);
    el("circle", { cx: pos[i][0], cy: pos[i][1], r: 22 }, g);
    const t = el("text", { x: pos[i][0], y: pos[i][1] }, g);
    t.textContent = LABELS[i];
    if (cycle && i !== 0) {                       // order badge
      const b = el("g", {}, g);
      el("circle", { cx: pos[i][0] + 18, cy: pos[i][1] - 18, r: 10, class: "badge" }, b);
      const bt = el("text", { x: pos[i][0] + 18, y: pos[i][1] - 18, class: "badge-t" }, b);
      bt.textContent = cycle.indexOf(i) + 1;
    }
    if (onNode) g.addEventListener("click", () => onNode(i));
  }
}

/* ---------- UI ---------- */
const $ = id => document.getElementById(id);
let adj = [], selected = null, currentPreset = Object.keys(PRESETS)[0];

function showError(msg) { $("error").textContent = msg || ""; $("error").hidden = !msg; }
function setResult(text, cls) { const r = $("result"); r.textContent = text; r.className = "result " + (cls || ""); }
function render(cycle) { drawGraph($("demoGraph"), adj, cycle || null, selected, onNodeClick); }

function loadGraph(a) {
  adj = a.map(r => [...r]); selected = null;
  $("matrix").value = matrixToText(adj);
  showError(""); setResult("Select a graph and press “Find Hamiltonian Cycle”."); render();
}

// Click two vertices to toggle the edge between them.
function onNodeClick(i) {
  if (selected === null) selected = i;
  else if (selected === i) selected = null;
  else {
    adj[selected][i] = adj[i][selected] = adj[i][selected] ? 0 : 1;
    selected = null; $("matrix").value = matrixToText(adj);
    setResult("Graph edited. Press “Find Hamiltonian Cycle”.");
  }
  showError(""); render();
}

function runFinder() {
  const p = parseMatrix($("matrix").value);        // always use the text box content
  if (p.error) { showError(p.error); return; }
  showError(""); adj = p.adj; selected = null;
  const { cycle, steps } = findHamiltonianCycle(adj);
  render(cycle);
  if (cycle) setResult(`Hamiltonian Cycle found: ${cycleToText(cycle)}  (${steps} steps checked)`, "ok");
  else setResult("No Hamiltonian Cycle exists for this graph.", "fail");
}

function init() {
  // mobile menu + active link highlight
  $("menuBtn").onclick = () => $("nav").classList.toggle("open");
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => $("nav").classList.remove("open")));
  const links = [...document.querySelectorAll("#nav a")];
  window.addEventListener("scroll", () => {
    let cur = "home";
    document.querySelectorAll("main section").forEach(s => { if (window.scrollY + 120 >= s.offsetTop) cur = s.id; });
    links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + cur));
  });

  // demo controls
  const sel = $("preset");
  Object.keys(PRESETS).forEach(k => sel.add(new Option(k, k)));
  sel.add(new Option("Custom (edit matrix)", "custom"));
  sel.onchange = () => { if (sel.value !== "custom") { currentPreset = sel.value; loadGraph(PRESETS[sel.value]); } };
  $("applyBtn").onclick = () => {
    const p = parseMatrix($("matrix").value);
    if (p.error) { showError(p.error); return; }
    adj = p.adj; selected = null; sel.value = "custom"; showError(""); setResult("Matrix applied. Press “Find Hamiltonian Cycle”."); render();
  };
  $("findBtn").onclick = runFinder;
  $("resetBtn").onclick = () => { if (sel.value === "custom") sel.value = currentPreset; loadGraph(PRESETS[currentPreset]); };
  loadGraph(PRESETS[currentPreset]);

  // hero + example graphs (cycle computed by the real algorithm)
  drawGraph($("heroGraph"), PRESETS[Object.keys(PRESETS)[0]], findHamiltonianCycle(PRESETS[Object.keys(PRESETS)[0]]).cycle);
  Object.keys(PRESETS).forEach((k, i) => {
    const g = PRESETS[k], { cycle } = findHamiltonianCycle(g);
    drawGraph($("ex" + (i + 1)), g, cycle);
    $("ex" + (i + 1) + "res").textContent = cycle ? "Cycle: " + cycleToText(cycle) : "No Hamiltonian Cycle exists.";
  });
}
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", init);
