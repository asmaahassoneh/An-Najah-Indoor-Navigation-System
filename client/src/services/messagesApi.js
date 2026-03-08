import API from "./api";

export const messagesApi = {
  getInbox: () => API.get("/messages/inbox"),

  getConversation: (userId) => API.get(`/messages/conversation/${userId}`),

  sendMessage: ({ receiverId, text }) =>
    API.post("/messages", { receiverId, text }),

  markRead: (userId) => API.put(`/messages/conversation/${userId}/read`),
  deleteConversation: (userId) =>
    API.delete(`/messages/conversation/${userId}`),
};
