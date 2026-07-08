"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import NewClientModal from "./NewClientModal";

export default function ClientTable({ clients }: { clients: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = clients.filter(c => 
    (c.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 border border-sand-border rounded-xl pl-10 pr-4 py-3 text-sand-text focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sand-surface text-sand-text px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          New Client
        </button>
      </div>

      <div className="bg-sand-surface border border-sand-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sand-border bg-white/[0.02]">
                <th className="p-4 text-xs font-bold text-sand-muted uppercase tracking-wider">Client Details</th>
                <th className="p-4 text-xs font-bold text-sand-muted uppercase tracking-wider">Contact</th>
                <th className="p-4 text-xs font-bold text-sand-muted uppercase tracking-wider">Language</th>
                <th className="p-4 text-xs font-bold text-sand-muted uppercase tracking-wider text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sand-muted text-sm">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-sand-text">{client.full_name || "—"}</div>
                      <div className="text-xs text-sand-muted">{client.id.split('-')[0]}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-700">{client.email}</div>
                      <div className="text-xs text-sand-muted">{client.phone || "No phone"}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold uppercase bg-black/5 text-sand-muted">
                        {client.preferred_lang === 'ta' ? 'தமிழ்' : client.preferred_lang === 'hi' ? 'हिन्दी' : 'English'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-sand-muted">
                      {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
