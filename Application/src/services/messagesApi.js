export const messagesApi = (api) => ({
  getInbox: () => api.get("/messages/inbox"),

  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),

  sendMessage: ({ receiverId, text }) =>
    api.post("/messages", { receiverId, text }),

  markRead: (userId) => api.put(`/messages/conversation/${userId}/read`),

  deleteConversation: (userId) =>
    api.delete(`/messages/conversation/${userId}`),
});
