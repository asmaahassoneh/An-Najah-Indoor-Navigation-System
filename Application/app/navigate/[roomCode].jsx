import { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import GlowBackground from "../../src/components/GlowBackground";
import ProtectedRoute from "../../src/routes/ProtectedRoute";
import useApi from "../../src/services/useApi";
import { mapsApi as mapsApiFactory } from "../../src/services/mapsApi";
import { floorImages } from "../../src/utils/floorImages";

export default function NavigateRoom() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { roomCode } = useLocalSearchParams();
  const api = useApi();
  const mapsApi = useMemo(() => mapsApiFactory(api), [api]);

  const [floors, setFloors] = useState([]);
  const [floor, setFloor] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  const [start, setStart] = useState({ x: 120, y: 120 });
  const [startRoom, setStartRoom] = useState("");
  const [startMode, setStartMode] = useState("tap");

  const [roomLoc, setRoomLoc] = useState(null);

  const [segments, setSegments] = useState([]);
  const [segIndex, setSegIndex] = useState(0);
  const [route, setRoute] = useState([]);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const clearRouteUI = useCallback(() => {
    setSegments([]);
    setSegIndex(0);
    setRoute([]);
  }, []);

  const loadGraphForFloor = useCallback(
    async (floorId) => {
      const g = await mapsApi.floorGraph(floorId);
      setGraph(g.data || { nodes: [], edges: [] });
    },
    [mapsApi],
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!alive) return;

        setLoading(true);
        setMsg("");
        clearRouteUI();

        const floorsRes = await mapsApi.floors();
        const list = floorsRes.data || [];
        if (!alive) return;

        setFloors(list);

        if (!list.length) {
          setFloor(null);
          setGraph({ nodes: [], edges: [] });
          setRoomLoc(null);
          setMsg("No floors available");
          return;
        }

        const locRes = await mapsApi.roomLocation(String(roomCode || ""));
        const loc = locRes.data;
        if (!alive) return;

        setRoomLoc(loc);

        const chosen =
          list.find((f) => Number(f.id) === Number(loc.floorId)) || null;

        if (!chosen) {
          setFloor(null);
          setGraph({ nodes: [], edges: [] });
          setMsg(`Room found but floorId=${loc.floorId} not in floors list`);
          return;
        }

        setFloor(chosen);
        await loadGraphForFloor(chosen.id);
        if (!alive) return;

        setMsg(`Loaded floor: ${chosen.name}`);
      } catch (e) {
        if (!alive) return;
        setFloor(null);
        setGraph({ nodes: [], edges: [] });
        setRoomLoc(null);
        setMsg(e.response?.data?.error || "Failed to load room/floor/graph");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [roomCode, mapsApi, clearRouteUI, loadGraphForFloor]);

  const stageW = Number(floor?.width || 1000);
  const stageH = Number(floor?.height || 800);

  const mapSource = useMemo(() => {
    const name = String(floor?.name || "");
    return name ? floorImages[name] : null;
  }, [floor]);

  const edgeLines = useMemo(() => {
    const map = new Map((graph.nodes || []).map((n) => [n.id, n]));
    return (graph.edges || [])
      .map((e) => {
        const a = map.get(e.fromNodeId);
        const b = map.get(e.toNodeId);
        if (!a || !b) return null;
        return { id: e.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      })
      .filter(Boolean);
  }, [graph]);

  const routePoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < route.length; i += 2) {
      pts.push({ x: route[i], y: route[i + 1] });
    }
    return pts;
  }, [route]);

  const setStartFromRoom = async () => {
    try {
      setMsg("");
      const res = await mapsApi.roomLocation(startRoom.trim());
      const loc = res.data;

      const f = floors.find((x) => Number(x.id) === Number(loc.floorId));
      if (f) {
        setFloor(f);
        await loadGraphForFloor(f.id);
      }

      setStart({ x: Number(loc.x), y: Number(loc.y) });
      clearRouteUI();
      setStartMode("room");
      setMsg(`Start set near room ${loc.roomCode} ✅`);
    } catch (e) {
      setMsg(e.response?.data?.error || "Could not find that room location");
    }
  };

  const requestRoute = async () => {
    if (!floor?.id) return;

    setMsg("");
    clearRouteUI();

    try {
      const res = await mapsApi.routeMulti({
        fromFloorId: floor.id,
        fromX: start.x,
        fromY: start.y,
        toRoom: String(roomCode || ""),
        prefer: "elevator",
      });

      const segs = res.data?.segments || [];
      if (!segs.length) {
        setMsg("No route found");
        return;
      }

      setSegments(segs);
      setSegIndex(0);

      const first = segs[0];
      setRoute((first.points || []).flatMap((p) => [p.x, p.y]));
      setMsg(first.instruction || "Route ready ✅");

      const f = floors.find((x) => Number(x.id) === Number(first.floorId));
      if (f) {
        setFloor(f);
        await loadGraphForFloor(f.id);
      }
    } catch (e) {
      setMsg(e.response?.data?.error || "No route found");
    }
  };

  const gotoSegment = async (i) => {
    const seg = segments[i];
    if (!seg) return;

    setSegIndex(i);
    setRoute((seg.points || []).flatMap((p) => [p.x, p.y]));
    setMsg(seg.instruction || "");

    const f = floors.find((x) => Number(x.id) === Number(seg.floorId));
    if (f) {
      setFloor(f);
      await loadGraphForFloor(f.id);
    }
  };

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
          <Text style={styles.badge}>Navigation</Text>

          <Text style={styles.title}>
            Navigate to{" "}
            <Text style={styles.code}>{String(roomCode || "")}</Text>
          </Text>

          <Text style={styles.sub}>
            {startMode === "tap"
              ? "Tap on the map to set your start point, then press Route."
              : "Start is set from a room. You can switch back to tap mode."}
          </Text>

          <View style={styles.pillsRow}>
            <Text style={styles.pill}>
              Graph: {(graph.nodes || []).length} nodes /{" "}
              {(graph.edges || []).length} edges
            </Text>
            {!!floor?.name && (
              <Text style={styles.pill}>Loaded: {floor.name}</Text>
            )}
          </View>

          <View style={styles.controls}>
            <View style={styles.group}>
              <Text style={styles.label}>Floor</Text>

              <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
                {floors.map((f) => {
                  const active = Number(f.id) === Number(floor?.id);
                  return (
                    <Pressable
                      key={f.id}
                      onPress={async () => {
                        try {
                          setFloor(f);
                          setMsg("");
                          clearRouteUI();
                          await loadGraphForFloor(f.id);
                        } catch {
                          setGraph({ nodes: [], edges: [] });
                          setMsg("Failed to load graph");
                        }
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={styles.chipText}>{f.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.meta}>
                Start: ({Math.round(start.x)}, {Math.round(start.y)})
              </Text>
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Start point</Text>

              <View style={styles.row}>
                <TextInput
                  value={startRoom}
                  onChangeText={setStartRoom}
                  placeholder="Closest room (e.g. 111170)"
                  placeholderTextColor="#cbd5f5"
                  style={styles.input}
                />
                <Pressable onPress={setStartFromRoom} style={styles.btnPrimary}>
                  <Text style={styles.btnText}>Set start</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  setStartMode("tap");
                  setMsg("Tap on map to set start point");
                }}
                style={[
                  styles.btnSoft,
                  startMode === "tap" && styles.btnSoftActive,
                ]}
              >
                <Text style={styles.btnText}>Use tap mode</Text>
              </Pressable>
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Route</Text>

              <Pressable
                onPress={requestRoute}
                style={[styles.btnPrimary, styles.btnBig]}
                disabled={loading || !floor?.id}
              >
                <Text style={styles.btnText}>
                  {loading ? "Loading..." : "Route"}
                </Text>
              </Pressable>

              {segments.length > 1 && (
                <View style={[styles.row, { marginTop: 10 }]}>
                  <Pressable
                    disabled={segIndex <= 0}
                    onPress={() => gotoSegment(segIndex - 1)}
                    style={[styles.btnSoft, segIndex <= 0 && { opacity: 0.5 }]}
                  >
                    <Text style={styles.btnText}>Previous</Text>
                  </Pressable>

                  <Pressable
                    disabled={segIndex >= segments.length - 1}
                    onPress={() => gotoSegment(segIndex + 1)}
                    style={[
                      styles.btnPrimary,
                      segIndex >= segments.length - 1 && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.btnText}>Next step</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {!!msg && <Text style={styles.toast}>{msg}</Text>}

          <View style={styles.mapWrap}>
            <ScrollView
              horizontal
              bounces={false}
              showsHorizontalScrollIndicator={true}
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
                      paddingHorizontal: 12,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "900",
                        textAlign: "center",
                      }}
                    >
                      Map not found for floor: {String(floor?.name || "-")}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        marginTop: 6,
                        textAlign: "center",
                      }}
                    >
                      Add this key to floorImages.js exactly like floor.name
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
                  onPress={(evt) => {
                    if (startMode !== "tap") return;
                    const { locationX, locationY } = evt.nativeEvent;
                    setStart({ x: locationX, y: locationY });
                    clearRouteUI();
                    setMsg("Start point updated");
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
                        stroke="rgba(255,0,0,0.35)"
                        strokeWidth={2}
                      />
                    ))}

                    {routePoints.length >= 2 &&
                      routePoints.map((p, idx) => {
                        if (idx === 0) return null;
                        const prev = routePoints[idx - 1];
                        return (
                          <Line
                            key={`r-${idx}`}
                            x1={prev.x}
                            y1={prev.y}
                            x2={p.x}
                            y2={p.y}
                            stroke="red"
                            strokeWidth={6}
                            strokeLinecap="round"
                          />
                        );
                      })}

                    <Circle cx={start.x} cy={start.y} r={8} fill="white" />
                    <SvgText
                      x={start.x + 10}
                      y={start.y - 8}
                      fill="white"
                      fontSize="12"
                    >
                      Start
                    </SvgText>

                    {roomLoc &&
                      floor?.id &&
                      Number(roomLoc.floorId) === Number(floor.id) && (
                        <>
                          <Circle
                            cx={Number(roomLoc.x)}
                            cy={Number(roomLoc.y)}
                            r={8}
                            fill="white"
                          />
                          <SvgText
                            x={Number(roomLoc.x) + 10}
                            y={Number(roomLoc.y) - 8}
                            fill="white"
                            fontSize="12"
                          >
                            {`Room ${String(roomCode || "")}`}
                          </SvgText>
                        </>
                      )}
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

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(143,92,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(143,92,255,0.35)",
    color: "white",
    fontWeight: "900",
    marginBottom: 10,
  },
  title: { color: "white", fontSize: 22, fontWeight: "900" },
  code: { color: "white", textDecorationLine: "underline" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  pill: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  controls: { marginTop: 12, gap: 12 },
  group: { gap: 8 },
  label: { color: "rgba(255,255,255,0.85)", fontWeight: "900" },
  meta: { color: "rgba(255,255,255,0.7)", marginTop: 6 },

  row: { flexDirection: "row", gap: 10, alignItems: "center" },

  input: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    color: "white",
  },

  btnPrimary: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  btnBig: { height: 52 },
  btnSoft: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnSoftActive: { borderColor: "rgba(143,92,255,0.6)" },
  btnText: { color: "white", fontWeight: "900" },

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
