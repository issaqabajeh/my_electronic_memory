import { useEffect, useState, useRef } from 'react';
import { msgApi, usersApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    msgApi.inbox().then(r => setInbox(r.data)).catch(() => {});
    usersApi.doctors().then(r => setContacts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    msgApi.thread(selected.id).then(r => setThread(r.data)).catch(() => {});
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selected) return;
    setSending(true);
    try {
      const res = await msgApi.send({ receiver_id: selected.id, body });
      setThread(t => [...t, res.data]);
      setBody('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const inboxContacts = [...new Map(inbox.map(m => {
    const id = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
    return [id, { id, name: `User #${id}` }];
  })).values()];

  const allContacts = [...new Map([...inboxContacts, ...contacts.map(c => ({ id: c.id, name: c.full_name }))].map(c => [c.id, c])).values()]
    .filter(c => c.id !== user?.id)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-blue-600" /> Messages
      </h1>

      <div className="flex gap-5 h-[580px]">
        {/* Contacts */}
        <div className="w-64 bg-white rounded-2xl border border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={13} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="text-sm outline-none bg-transparent w-full" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {allContacts.length === 0 && <p className="text-sm text-gray-400 p-3 text-center">No contacts</p>}
            {allContacts.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${selected?.id === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${selected?.id === c.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {c.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <MessageCircle size={52} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm text-gray-400">Select a contact to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{selected.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {thread.length === 0 && (
                  <p className="text-center text-gray-400 text-sm pt-10">No messages yet. Say hello!</p>
                )}
                {thread.map(msg => {
                  const mine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        <p>{msg.body}</p>
                        <p className={`text-xs mt-1 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {format(new Date(msg.sent_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="p-4 border-t border-gray-100 flex gap-3">
                <input value={body} onChange={e => setBody(e.target.value)} placeholder="Type a message…"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={!body.trim() || sending}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
