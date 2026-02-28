import React from "react";
import { useEffect, useMemo, useState } from "react";
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
  const floor = useMemo(
    () => floors.find((f) => String(f.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [msg, setMsg] = useState("");

  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [img] = useImage(floor?.imageUrl || "");

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
        const [graphRes, roomsRes] = await Promise.all([
          API.get(`/maps/floors/${floorId}/graph`),
          API.get(`/maps/floors/${floorId}/rooms`),
        ]);

        const g = graphRes.data || { nodes: [], edges: [] };
        setNodes(g.nodes || []);
        setEdges(g.edges || []);
        setRooms(roomsRes.data || []);
        setSelectedNodeId(null);
      } catch (e) {
        setMsg(e.response?.data?.error || "Failed to load floor data");
      }
    })();
  }, [floorId]);

  const reloadGraph = async () => {
    if (!floorId) return;
    const res = await API.get(`/maps/floors/${floorId}/graph`);
    const rr = await API.get(`/maps/floors/${floorId}/rooms`);
    setRooms(rr.data || []);
    const g = res.data || { nodes: [], edges: [] };
    setNodes(g.nodes || []);
    setEdges(g.edges || []);
  };

  const addNode = async (pos) => {
    if (!floorId) return;
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
    if (!floorId) return;
    try {
      await API.post("/maps/edges", {
        floorId: Number(floorId),
        fromNodeId,
        toNodeId,
      });
      setMsg("Edge created ✅");
      setSelectedNodeId(null);
      await reloadGraph();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to create edge");
    }
  };

  const edgeLines = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.id, n]));
    return edges
      .map((e) => {
        const a = map.get(e.fromNodeId);
        const b = map.get(e.toNodeId);
        if (!a || !b) return null;
        return [a.x, a.y, b.x, b.y];
      })
      .filter(Boolean);
  }, [nodes, edges]);

  const stageW = floor?.width || 1200;
  const stageH = floor?.height || 800;

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div
        className="authCard authCardEnter"
        style={{ width: "min(1200px, 96vw)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div className="authBadge">Admin</div>
            <h2 className="authTitle" style={{ marginBottom: 4 }}>
              Graph Builder
            </h2>
            <p className="authSub" style={{ margin: 0 }}>
              Select a floor, click map to add nodes. Click two nodes to connect
              an edge.
            </p>
            <input
              className="admin-input"
              placeholder="Room code (e.g. 111170)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />

            <button
              className="authBtn authBtnSecondary"
              type="button"
              onClick={() => setMode("room")}
            >
              Place Room Location
            </button>

            <button
              className="authBtn authBtnSecondary"
              type="button"
              onClick={() => setMode("node")}
            >
              Add Nodes
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={floorId}
              onChange={(e) => setFloorId(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
              }}
            >
              {floors.map((f) => (
                <option
                  key={f.id}
                  value={String(f.id)}
                  style={{ color: "black" }}
                >
                  {f.key} — {f.name}
                </option>
              ))}
            </select>

            <button
              className="authBtn authBtnSecondary"
              type="button"
              onClick={() => {
                setSelectedNodeId(null);
                setMsg("Edge selection cleared");
              }}
            >
              Clear selection
            </button>
          </div>
        </div>

        <div
          style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <div className="authMsg" style={{ margin: 0 }}>
            Nodes: <b>{nodes.length}</b> / Edges: <b>{edges.length}</b>
            {selectedNodeId ? (
              <>
                {" "}
                — Selected Node: <b>{selectedNodeId}</b>
              </>
            ) : null}
          </div>
          {!!msg && (
            <div className="authMsg" style={{ margin: 0, opacity: 0.95 }}>
              {msg}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, overflow: "auto", borderRadius: 14 }}>
          <Stage
            width={stageW}
            height={stageH}
            onMouseDown={async (e) => {
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (!pos) return;
              const isBackgroundClick =
                e.target === stage || e.target.className === "Image";

              if (!isBackgroundClick) return;

              if (mode === "room") {
                const code = roomCode.trim();
                if (!code) {
                  setMsg("Enter room code first");
                  return;
                }

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
                    err.response?.data?.error || "Failed to save room location",
                  );
                }
                return;
              }

              addNode(pos);
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

              {edgeLines.map((pts, idx) => (
                <Line
                  key={idx}
                  points={pts}
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                  opacity={0.9}
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
                    fill="white"
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
                      radius={isSelected ? 10 : 7}
                      onClick={() => {
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
                        connectNodes(selectedNodeId, n.id);
                      }}
                    />
                    <Text
                      x={n.x + 10}
                      y={n.y - 10}
                      text={`${n.id}`}
                      fontSize={12}
                    />
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>

        <div
          style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <button
            className="authBtn authBtnSecondary"
            type="button"
            onClick={async () => {
              setMsg("");
              await reloadGraph();
              setMsg("Graph refreshed ✅");
            }}
          >
            Refresh
          </button>

          <button
            className="authBtn authBtnSecondary"
            type="button"
            onClick={() => {
              alert(
                "Tip:\n- Click on empty map = add node\n- Click node A then node B = create edge\n- Use Clear selection if needed",
              );
            }}
          >
            Help
          </button>
        </div>
      </div>
    </div>
  );
}
