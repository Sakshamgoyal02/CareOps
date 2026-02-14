import api from "./axios.js";

export const getContacts = () => api.get("/inbox/contacts").then((r) => r.data);
export const getConversation = (contactId) =>
  api.get(`/inbox/conversations/${contactId}`).then((r) => r.data);
export const replyToConversation = (contactId, content) =>
  api.post(`/inbox/conversations/${contactId}/reply`, { content }).then((r) => r.data);
