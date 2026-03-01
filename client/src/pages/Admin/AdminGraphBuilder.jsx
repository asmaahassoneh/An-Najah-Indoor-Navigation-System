import React, { useEffect, useMemo, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Text,
} from "react-konva";
import useImage from "use-image";
import API from "../../services/api";

export default function AdminGraphBuilder() {
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [mode, setMode] = useState("node");
  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const floor = useMemo(
    () => floors.find((f) => String(f.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const [img] = useImage(floor?.imageUrl || "");

  const stageW = floor?.width || 1200;
  const stageH = floor?.height || 800;

  const reloadGraph = async () => {
    if (!floorId) return;
    const [graphRes, roomsRes] = await Promise.all([
      API.get(`/maps/floors/${floorId}/graph`),
      API.get(`/maps/floors/${floorId}/rooms`),
    ]);
    const g = graphRes.data || { nodes: [], edges: [] };
    setNodes(g.nodes || []);
    setEdges(g.edges || []);
    setRooms(roomsRes.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/maps/floors");
        const list = res.data || [];
        setFloors(list);
        if (list.length && !floorId) setFloorId(String(list[0].id));
      } catch (e) {
        setMsg(e.response?.data?.error || "Failed to load floors");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!floorId) return;
      try {
        setMsg("");
        await reloadGraph();
        setSelectedNodeId(null);
      } catch (e) {
        setMsg(e.response?.data?.error || "Failed to load floor data");
      }
    })();
  }, [floorId]);

  const addNode = async (pos) => {
    if (!floorId) return setMsg("Select a floor first");
    try {
      await API.post("/maps/nodes", {
        floorId: Number(floorId),
        x: pos.x,
        y: pos.y,
      });
      setMsg("Node added ✅");
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to add node");
    }
  };

  const connectNodes = async (fromNodeId, toNodeId) => {
    if (!floorId) return setMsg("Select a floor first");
    try {
      await API.post("/maps/edges", {
        floorId: Number(floorId),
        fromNodeId: Number(fromNodeId),
        toNodeId: Number(toNodeId),
      });
      setMsg("Edge created ✅");
      setSelectedNodeId(null);
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to create edge");
    }
  };

  const clearAllNodes = async () => {
    if (!floorId) return setMsg("Select a floor first");
    if (!window.confirm("Delete ALL nodes and edges for this floor?")) return;

    try {
      await API.delete(`/maps/floors/${floorId}/graph`);
      setMsg("All nodes cleared ✅");
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to clear floor");
    }
  };

  const connectAllNodesMST = async () => {
    if (!floorId) return setMsg("Select a floor first");
    if (nodes.length < 2) return setMsg("Need at least 2 nodes");

    const existing = new Set(
      edges.map((e) => {
        const a = Number(e.fromNodeId);
        const b = Number(e.toNodeId);
        return `${Math.min(a, b)}-${Math.max(a, b)}`;
      }),
    );

    const dist2 = (a, b) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return dx * dx + dy * dy;
    };

    const visited = new Set();
    visited.add(nodes[0].id);

    try {
      setMsg("Connecting all nodes (MST)...");
      while (visited.size < nodes.length) {
        let bestEdge = null;
        let bestD = Infinity;

        for (const a of nodes) {
          if (!visited.has(a.id)) continue;
          for (const b of nodes) {
            if (visited.has(b.id)) continue;
            const d = dist2(a, b);
            if (d < bestD) {
              bestD = d;
              bestEdge = { from: a, to: b };
            }
          }
        }

        if (!bestEdge) break;

        const fromId = Number(bestEdge.from.id);
        const toId = Number(bestEdge.to.id);
        const key = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;

        if (!existing.has(key)) {
          await API.post("/maps/edges", {
            floorId: Number(floorId),
            fromNodeId: fromId,
            toNodeId: toId,
          });
          existing.add(key);
        }

        visited.add(bestEdge.to.id);
      }

      setMsg("All nodes connected ✅");
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to connect nodes");
    }
  };

  const connectAllNodesNearest = async () => {
    if (!floorId) return setMsg("Select a floor first");
    if (nodes.length < 2) return setMsg("Need at least 2 nodes");

    const existing = new Set(
      edges.map((e) => {
        const a = Number(e.fromNodeId);
        const b = Number(e.toNodeId);
        return `${Math.min(a, b)}-${Math.max(a, b)}`;
      }),
    );

    const dist2 = (a, b) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return dx * dx + dy * dy;
    };

    try {
      setMsg("Connecting nodes...");
      for (const n of nodes) {
        let best = null;
        let bestD = Infinity;

        for (const m of nodes) {
          if (m.id === n.id) continue;
          const d = dist2(n, m);
          if (d < bestD) {
            bestD = d;
            best = m;
          }
        }

        if (!best) continue;

        const a = Number(n.id);
        const b = Number(best.id);
        const key = `${Math.min(a, b)}-${Math.max(a, b)}`;

        if (existing.has(key)) continue;

        await API.post("/maps/edges", {
          floorId: Number(floorId),
          fromNodeId: a,
          toNodeId: b,
        });

        existing.add(key);
      }

      setMsg("Auto-connect done ✅");
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to auto-connect nodes");
    }
  };

  const edgeLines = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.id, n]));
    return edges
      .map((e) => {
        const a = map.get(e.fromNodeId);
        const b = map.get(e.toNodeId);
        if (!a || !b) return null;
        return { id: e.id, points: [a.x, a.y, b.x, b.y] };
      })
      .filter(Boolean);
  }, [nodes, edges]);

  return (
    <div className="gbPage">
      <div className="gbCard">
        <div className="gbHeader">
          <div className="gbTitleRow">
            <div className="gbBadge">Admin</div>
            <div>
              <h2 className="gbTitle">Graph Builder</h2>
              <p className="gbSub">
                Select a floor, click map to add nodes. Click two nodes to
                connect an edge.
              </p>
            </div>
          </div>

          <div className="gbControls">
            <div className="gbGroup">
              <label className="gbLabel">Room code</label>
              <input
                className="gbInput"
                placeholder="e.g. 111170"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />

              <label className="gbLabel">Floor</label>
              <select
                className="gbSelect"
                value={floorId}
                onChange={(e) => setFloorId(e.target.value)}
              >
                {floors.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.key} — {f.name}
                  </option>
                ))}
              </select>

              <button
                className="gbBtn gbBtnGhost"
                type="button"
                onClick={() => {
                  setSelectedNodeId(null);
                  setMsg("Edge selection cleared");
                }}
              >
                Clear selection
              </button>
            </div>

            <div className="gbActions">
              <div className="gbActionBlock">
                <div className="gbActionTitle">Mode</div>
                <div className="gbActionRow">
                  <button
                    className={`gbBtn ${mode === "node" ? "gbBtnActive" : "gbBtnSoft"}`}
                    type="button"
                    onClick={() => setMode("node")}
                  >
                    Add Nodes
                  </button>

                  <button
                    className={`gbBtn ${mode === "room" ? "gbBtnActive" : "gbBtnSoft"}`}
                    type="button"
                    onClick={() => setMode("room")}
                  >
                    Place Room
                  </button>

                  <button
                    className={`gbBtn ${mode === "delete" ? "gbBtnDangerActive" : "gbBtnDanger"}`}
                    type="button"
                    onClick={() => setMode("delete")}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="gbActionBlock">
                <div className="gbActionTitle">Connect</div>
                <div className="gbActionRow">
                  <button
                    className="gbBtn gbBtnSoft"
                    type="button"
                    onClick={connectAllNodesMST}
                  >
                    Connect All (MST)
                  </button>
                  <button
                    className="gbBtn gbBtnSoft"
                    type="button"
                    onClick={connectAllNodesNearest}
                  >
                    Auto Connect
                  </button>
                </div>
              </div>

              <div className="gbActionBlock">
                <div className="gbActionTitle">Manage</div>
                <div className="gbActionRow">
                  <button
                    className="gbBtn gbBtnSoft"
                    type="button"
                    onClick={async () => {
                      try {
                        setMsg("");
                        await reloadGraph();
                        setMsg("Graph refreshed ✅");
                      } catch (e) {
                        setMsg(e.response?.data?.error || "Failed to refresh");
                      }
                    }}
                  >
                    Refresh
                  </button>

                  <button
                    className="gbBtn gbBtnSoft"
                    type="button"
                    onClick={clearAllNodes}
                  >
                    Clear All
                  </button>

                  <button
                    className="gbBtn gbBtnGhost"
                    type="button"
                    onClick={() => {
                      alert(
                        "Tip:\n- Click empty map = add node\n- Click node A then node B = create edge\n- Use Clear selection if needed",
                      );
                    }}
                  >
                    Help
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="gbStatusRow">
            <div className="gbPills">
              <div className="gbPill">
                Nodes: <b>{nodes.length}</b>
              </div>
              <div className="gbPill">
                Edges: <b>{edges.length}</b>
              </div>
              {selectedNodeId ? (
                <div className="gbPill">
                  Selected: <b>{selectedNodeId}</b>
                </div>
              ) : null}
              <div className="gbPill">
                Editing: <b>{floor?.key || "-"}</b> — {floor?.name || "-"}
              </div>
            </div>

            {!!msg && <div className="gbToast">{msg}</div>}
          </div>
        </div>

        <div className="gbCanvasWrap">
          <div className="gbCanvasInner">
            <Stage
              width={stageW}
              height={stageH}
              onMouseDown={async (e) => {
                const stage = e.target.getStage();
                const pos = stage?.getPointerPosition();
                if (!pos) return;

                const isBackgroundClick =
                  e.target === stage || e.target.className === "Image";
                const isAllowedClick =
                  e.target === stage ||
                  e.target.className === "Image" ||
                  e.target.className === "Line";

                if (!isBackgroundClick) return;
                if (!isAllowedClick) return;

                if (mode === "room") {
                  const code = roomCode.trim();
                  if (!code) return setMsg("Enter room code first");

                  try {
                    await API.put(`/maps/floors/${floorId}/rooms`, {
                      roomCode: code,
                      x: pos.x,
                      y: pos.y,
                    });

                    setMsg(`Room ${code} location saved ✅`);
                    await reloadGraph();
                  } catch (err) {
                    setMsg(
                      err.response?.data?.error ||
                        "Failed to save room location",
                    );
                  }
                  return;
                }

                if (mode === "node") {
                  await addNode(pos);
                }
              }}
            >
              <Layer>
                <KonvaImage
                  image={img}
                  x={0}
                  y={0}
                  width={stageW}
                  height={stageH}
                />

                {edgeLines.map((edge) => (
                  <Line
                    key={edge.id}
                    points={edge.points}
                    stroke="red"
                    strokeWidth={4}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.9}
                    onMouseDown={async (evt) => {
                      if (mode !== "delete") return;
                      evt.cancelBubble = true;

                      if (!window.confirm(`Delete edge ${edge.id}?`)) return;
                      try {
                        await API.delete(`/maps/edges/${edge.id}`);
                        setMsg(`Edge ${edge.id} deleted ✅`);
                        await reloadGraph();
                      } catch (e) {
                        setMsg(
                          e.response?.data?.error || "Failed to delete edge",
                        );
                      }
                    }}
                  />
                ))}

                {rooms.map((r) => (
                  <React.Fragment key={r.id}>
                    <Circle x={r.x} y={r.y} radius={6} fill="red" />
                    <Text
                      x={r.x + 8}
                      y={r.y - 8}
                      text={r.roomCode}
                      fontSize={12}
                      fill="black"
                    />
                  </React.Fragment>
                ))}

                {nodes.map((n) => {
                  const isSelected = n.id === selectedNodeId;
                  return (
                    <React.Fragment key={n.id}>
                      <Circle
                        x={n.x}
                        y={n.y}
                        radius={isSelected ? 5 : 3}
                        fill="red"
                        onClick={async (evt) => {
                          evt.cancelBubble = true;

                          if (mode === "delete") {
                            if (!window.confirm(`Delete node ${n.id}?`)) return;
                            try {
                              await API.delete(`/maps/nodes/${n.id}`);
                              setMsg(`Node ${n.id} deleted ✅`);
                              await reloadGraph();
                            } catch (e) {
                              setMsg(
                                e.response?.data?.error ||
                                  "Failed to delete node",
                              );
                            }
                            return;
                          }

                          if (mode !== "node" && mode !== "room") return;

                          if (!selectedNodeId) {
                            setSelectedNodeId(n.id);
                            setMsg(
                              `Selected node ${n.id}. Now click another node to connect.`,
                            );
                            return;
                          }

                          if (selectedNodeId === n.id) {
                            setSelectedNodeId(null);
                            setMsg("Selection cleared");
                            return;
                          }

                          await connectNodes(selectedNodeId, n.id);
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}
