function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildAdj(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);

  for (const e of edges) {
    if (!byId.has(e.fromNodeId) || !byId.has(e.toNodeId)) continue;
    adj.get(e.fromNodeId).push({ to: e.toNodeId, cost: e.cost });
    adj.get(e.toNodeId).push({ to: e.fromNodeId, cost: e.cost });
  }
  return { byId, adj };
}

function astar(nodes, edges, startId, goalId) {
  const { byId, adj } = buildAdj(nodes, edges);

  if (!byId.has(startId) || !byId.has(goalId)) {
    return { path: [], cost: Infinity };
  }

  const start = byId.get(startId);
  const goal = byId.get(goalId);

  const open = new Set([startId]);
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();
  for (const n of nodes) {
    gScore.set(n.id, Infinity);
    fScore.set(n.id, Infinity);
  }
  gScore.set(startId, 0);
  fScore.set(startId, dist(start, goal));

  function bestOpenNode() {
    let best = null;
    let bestF = Infinity;
    for (const id of open) {
      const f = fScore.get(id) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        best = id;
      }
    }
    return best;
  }

  while (open.size) {
    const current = bestOpenNode();
    if (current === null) break;

    if (current === goalId) {
      const path = [current];
      let cur = current;
      while (cameFrom.has(cur)) {
        cur = cameFrom.get(cur);
        path.push(cur);
      }
      path.reverse();
      return { path, cost: gScore.get(goalId) };
    }

    open.delete(current);

    const neighbors = adj.get(current) || [];
    for (const nb of neighbors) {
      const tentative = (gScore.get(current) ?? Infinity) + nb.cost;
      if (tentative < (gScore.get(nb.to) ?? Infinity)) {
        cameFrom.set(nb.to, current);
        gScore.set(nb.to, tentative);
        const h = dist(byId.get(nb.to), goal);
        fScore.set(nb.to, tentative + h);
        open.add(nb.to);
      }
    }
  }

  return { path: [], cost: Infinity };
}

module.exports = { astar, dist };
