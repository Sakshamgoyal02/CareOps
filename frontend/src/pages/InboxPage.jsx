import { useState, useEffect } from "react";
import { getContacts } from "../api/inbox";
import { getConversation, replyToConversation } from "../api/inbox";
import InboxThread from "../components/inbox/InboxThread";

export default function InboxPage() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReply = async (contactId, content) => {
    await replyToConversation(contactId, content);
    setSelected(null);
    const list = await getContacts();
    setContacts(list);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
      <div className="bg-white rounded-lg shadow flex flex-col lg:flex-row min-h-[500px]">
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
          {contacts.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No contacts yet</p>
          ) : (
            contacts.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 ${
                  selected?._id === c._id ? "bg-indigo-50" : ""
                }`}
              >
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500 truncate">{c.email || c.phone}</p>
                <span className="text-xs text-gray-400 capitalize">{c.status}</span>
              </button>
            ))
          )}
        </div>
        <div className="flex-1 min-h-[300px]">
          {selected ? (
            <InboxThread
              contact={selected}
              onReply={handleReply}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
