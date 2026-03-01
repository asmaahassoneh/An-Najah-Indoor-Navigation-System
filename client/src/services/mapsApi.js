import API from "./api";

export const mapsApi = {
  floors: () => API.get("/maps/floors"),
  floorRooms: (floorId) => API.get(`/maps/floors/${floorId}/rooms`),
  floorGraph: (floorId) => API.get(`/maps/floors/${floorId}/graph`),

  routeToRoom: ({ floorId, fromX, fromY, toRoom }) =>
    API.get(`/maps/route`, { params: { floorId, fromX, fromY, toRoom } }),

  roomLocation: (roomCode) =>
    API.get(`/maps/room/${encodeURIComponent(roomCode)}`),

  routeMulti: ({ fromFloorId, fromX, fromY, toRoom, prefer }) =>
    API.get("/maps/route-multi", {
      params: { fromFloorId, fromX, fromY, toRoom, prefer },
    }),
};
