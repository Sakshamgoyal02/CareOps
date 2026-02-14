import { useState, useEffect } from "react";
import { getConversation } from "../../api/inbox";

export default function InboxThread({ contact, onReply, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    getConversation(contact._id)
      .then(setConversation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [contact._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await onReply(contact._id, reply.trim());
      setReply("");
      const conv = await getConversation(contact._id);
      setConversation(conv);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{contact.name}</p>
          <p className="text-sm text-gray-500">{contact.email || contact.phone}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          (conversation?.messages || []).map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.sender === "staff"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{m.content}</p>
                <p className="text-xs opacity-75 mt-1">
                  {m.sender} · {new Date(m.timestamp).toLocaleString()} · {m.channel}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
