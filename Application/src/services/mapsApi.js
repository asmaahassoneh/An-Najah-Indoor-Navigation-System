export const mapsApi = (api) => ({
  floors: () => api.get("/maps/floors"),
  floorGraph: (floorId) => api.get(`/maps/floors/${floorId}/graph`),
  floorRooms: (floorId) => api.get(`/maps/floors/${floorId}/rooms`),
  roomLocation: (roomCode) =>
    api.get(`/maps/room/${encodeURIComponent(roomCode)}`),
  routeMulti: ({ fromFloorId, fromX, fromY, toRoom, prefer }) =>
    api.get("/maps/route-multi", {
      params: {
        fromFloorId: String(fromFloorId ?? ""),
        fromX: String(fromX ?? ""),
        fromY: String(fromY ?? ""),
        toRoom: String(toRoom ?? "").trim(),
        prefer: prefer || "elevator",
      },
    }),
});
