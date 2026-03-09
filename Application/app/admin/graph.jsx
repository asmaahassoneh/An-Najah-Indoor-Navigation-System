import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import GlowBackground from "../../src/components/GlowBackground";
import AdminRoute from "../../src/routes/AdminRoute";
import useApi from "../../src/services/useApi";
import { floorImages } from "../../src/utils/floorImages";

export default function AdminGraphBuilder() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const api = useApi();

  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [mode, setMode] = useState("node");
  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeType, setNodeType] = useState("hall");
  const [nodeLabel, setNodeLabel] = useState("");

  const floor = useMemo(
    () => floors.find((f) => String(f.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const stageW = Number(floor?.width || 1000);
  const stageH = Number(floor?.height || 800);

  const mapSource = useMemo(() => {
    const name = String(floor?.name || "");
    return name ? floorImages[name] : null;
  }, [floor]);

  const reloadGraph = async () => {
    if (!floorId) return;
    const [graphRes, roomsRes] = await Promise.all([
      api.get(`/maps/floors/${floorId}/graph`),
      api.get(`/maps/floors/${floorId}/rooms`),
    ]);
    const g = graphRes.data || { nodes: [], edges: [] };
    setNodes(g.nodes || []);
    setEdges(g.edges || []);
    setRooms(roomsRes.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/maps/floors");
        const list = res.data || [];
        setFloors(list);
        if (list.length && !floorId) setFloorId(String(list[0].id));
      } catch (e) {
        setMsg(e.response?.data?.error || "Failed to load floors");
      }
    })();
  }, [api, floorId]);

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
  });

  const addNode = async (pos) => {
    if (!floorId) return setMsg("Select a floor first");
    try {
      await api.post("/maps/nodes", {
        floorId: Number(floorId),
        x: pos.x,
        y: pos.y,
        type: nodeType,
        label:
          nodeType === "stairs" || nodeType === "elevator"
            ? nodeLabel.trim().toUpperCase()
            : null,
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
      await api.post("/maps/edges", {
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

  const clearAll = () => {
    if (!floorId) return;
    Alert.alert(
      "Clear Floor Graph",
      "Delete all nodes and edges for this floor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/maps/floors/${floorId}/graph`);
              setMsg("All nodes cleared ✅");
              await reloadGraph();
            } catch (e) {
              setMsg(e.response?.data?.error || "Failed to clear floor");
            }
          },
        },
      ],
    );
  };

  const deleteNode = (id) => {
    Alert.alert("Delete Node", `Delete node ${id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/maps/nodes/${id}`);
            setMsg(`Node ${id} deleted ✅`);
            await reloadGraph();
          } catch (e) {
            setMsg(e.response?.data?.error || "Failed to delete node");
          }
        },
      },
    ]);
  };

  const deleteEdge = (id) => {
    Alert.alert("Delete Edge", `Delete edge ${id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/maps/edges/${id}`);
            setMsg(`Edge ${id} deleted ✅`);
            await reloadGraph();
          } catch (e) {
            setMsg(e.response?.data?.error || "Failed to delete edge");
          }
        },
      },
    ]);
  };

  const edgeLines = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.id, n]));
    return edges
      .map((e) => {
        const a = map.get(e.fromNodeId);
        const b = map.get(e.toNodeId);
        if (!a || !b) return null;
        return { id: e.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      })
      .filter(Boolean);
  }, [nodes, edges]);

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Graph Builder</Text>
          <Text style={styles.sub}>
            Tap map to add nodes or place rooms. Tap node twice workflow is used
            for edges.
          </Text>

          <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
            {floors.map((f) => {
              const active = String(f.id) === String(floorId);
              return (
                <Pressable
                  key={f.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFloorId(String(f.id))}
                >
                  <Text style={styles.chipText}>
                    {f.key} — {f.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.formGroup}>
            <TextInput
              style={styles.input}
              placeholder="Room code (for Place Room mode)"
              placeholderTextColor="#cbd5f5"
              value={roomCode}
              onChangeText={setRoomCode}
            />

            <TextInput
              style={styles.input}
              placeholder="Node type: hall / stairs / elevator / entrance / exit"
              placeholderTextColor="#cbd5f5"
              value={nodeType}
              onChangeText={setNodeType}
            />

            <TextInput
              style={styles.input}
              placeholder="Connector label (E1, S1)"
              placeholderTextColor="#cbd5f5"
              value={nodeLabel}
              onChangeText={setNodeLabel}
            />
          </View>

          <View style={styles.rowWrap}>
            <Pressable
              style={[styles.modeBtn, mode === "node" && styles.modeBtnActive]}
              onPress={() => setMode("node")}
            >
              <Text style={styles.btnText}>Add Nodes</Text>
            </Pressable>

            <Pressable
              style={[styles.modeBtn, mode === "room" && styles.modeBtnActive]}
              onPress={() => setMode("room")}
            >
              <Text style={styles.btnText}>Place Room</Text>
            </Pressable>

            <Pressable
              style={[
                styles.deleteBtn,
                mode === "delete" && styles.modeBtnActive,
              ]}
              onPress={() => setMode("delete")}
            >
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>

          <View style={styles.rowWrap}>
            <Pressable
              style={styles.softBtn}
              onPress={() => {
                setSelectedNodeId(null);
                setMsg("Selection cleared");
              }}
            >
              <Text style={styles.btnText}>Clear Selection</Text>
            </Pressable>

            <Pressable
              style={styles.softBtn}
              onPress={async () => {
                try {
                  await reloadGraph();
                  setMsg("Graph refreshed ✅");
                } catch (e) {
                  setMsg(e.response?.data?.error || "Failed to refresh");
                }
              }}
            >
              <Text style={styles.btnText}>Refresh</Text>
            </Pressable>

            <Pressable style={styles.softBtn} onPress={clearAll}>
              <Text style={styles.btnText}>Clear All</Text>
            </Pressable>
          </View>

          <View style={styles.stats}>
            <Text style={styles.stat}>Nodes: {nodes.length}</Text>
            <Text style={styles.stat}>Edges: {edges.length}</Text>
            <Text style={styles.stat}>Selected: {selectedNodeId ?? "-"}</Text>
          </View>

          {!!msg && <Text style={styles.toast}>{msg}</Text>}

          <View style={styles.mapWrap}>
            <ScrollView
              horizontal
              bounces={false}
              contentContainerStyle={{ width: stageW }}
            >
              <View style={{ width: stageW, height: stageH }}>
                {mapSource ? (
                  <Image
                    source={mapSource}
                    style={{
                      width: stageW,
                      height: stageH,
                      position: "absolute",
                    }}
                    resizeMode="stretch"
                  />
                ) : (
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "900" }}>
                      Map not found for floor: {String(floor?.name || "-")}
                    </Text>
                  </View>
                )}

                <Pressable
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onPress={async (evt) => {
                    const { locationX, locationY } = evt.nativeEvent;
                    const pos = { x: locationX, y: locationY };

                    if (mode === "room") {
                      const code = roomCode.trim();
                      if (!code) return setMsg("Enter room code first");

                      try {
                        await api.put(`/maps/floors/${floorId}/rooms`, {
                          roomCode: code,
                          x: pos.x,
                          y: pos.y,
                        });
                        setMsg(`Room ${code} location saved ✅`);
                        await reloadGraph();
                      } catch (e) {
                        setMsg(
                          e.response?.data?.error ||
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
                  <Svg width={stageW} height={stageH}>
                    {edgeLines.map((e) => (
                      <Line
                        key={e.id}
                        x1={e.x1}
                        y1={e.y1}
                        x2={e.x2}
                        y2={e.y2}
                        stroke="red"
                        strokeWidth={4}
                        onPress={() => {
                          if (mode === "delete") deleteEdge(e.id);
                        }}
                      />
                    ))}

                    {rooms.map((r) => (
                      <View key={r.id} />
                    ))}

                    {rooms.map((r) => (
                      <>
                        <Circle
                          key={`room-c-${r.id}`}
                          cx={r.x}
                          cy={r.y}
                          r={6}
                          fill="red"
                        />
                        <SvgText
                          key={`room-t-${r.id}`}
                          x={r.x + 8}
                          y={r.y - 8}
                          fill="black"
                          fontSize="12"
                        >
                          {r.roomCode}
                        </SvgText>
                      </>
                    ))}

                    {nodes.map((n) => {
                      const isSelected = n.id === selectedNodeId;
                      const radius = isSelected
                        ? n.type === "stairs" || n.type === "elevator"
                          ? 12
                          : 6
                        : n.type === "stairs" || n.type === "elevator"
                          ? 10
                          : 4;

                      return (
                        <>
                          <Circle
                            key={`node-c-${n.id}`}
                            cx={n.x}
                            cy={n.y}
                            r={radius}
                            fill="red"
                            onPress={async () => {
                              if (mode === "delete") {
                                deleteNode(n.id);
                                return;
                              }

                              if (!selectedNodeId) {
                                setSelectedNodeId(n.id);
                                setMsg(
                                  `Selected node ${n.id}. Tap another node to connect.`,
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

                          <SvgText
                            key={`node-t-${n.id}`}
                            x={n.x + 8}
                            y={n.y - 8}
                            fill="black"
                            fontSize="12"
                          >
                            {n.type === "stairs" || n.type === "elevator"
                              ? `${n.type.toUpperCase()} ${n.label || ""}`
                              : ""}
                          </SvgText>
                        </>
                      );
                    })}
                  </Svg>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "white", fontSize: 24, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6, marginBottom: 12 },
  formGroup: { marginTop: 12, gap: 10 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    color: "white",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  modeBtn: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtnActive: {
    borderColor: "rgba(143,92,255,0.7)",
    backgroundColor: "#8f5cff",
  },
  deleteBtn: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 107, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  softBtn: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "white", fontWeight: "900" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  stat: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  toast: {
    marginTop: 12,
    color: "white",
    fontWeight: "900",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipActive: { borderColor: "rgba(143,92,255,0.6)" },
  chipText: { color: "white", fontWeight: "900", fontSize: 12 },
  mapWrap: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
