"use client";

import { useState } from "react";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";
import { togglePackageActive } from "@/app/actions/packages";
import PackageModal from "./PackageModal";

const colorStyles: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-900/20 border-blue-500/30 text-blue-400",
  gold: "from-yellow-500/20 to-yellow-900/20 border-yellow-500/30 text-yellow-400",
  purple: "from-purple-500/20 to-purple-900/20 border-purple-500/30 text-purple-400",
  emerald: "from-emerald-500/20 to-emerald-900/20 border-emerald-500/30 text-emerald-400",
};

export default function PackageGrid({ packages }: { packages: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const openNewModal = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await togglePackageActive(id, !currentStatus);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Add Package Card */}
        <button 
          onClick={openNewModal}
          className="border-2 border-dashed border-sand-border rounded-3xl p-8 flex flex-col items-center justify-center text-sand-muted hover:text-sand-text hover:border-white/40 hover:bg-black/5 transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <p className="font-bold">Create New Package</p>
          <p className="text-sm mt-2 text-center max-w-[200px]">Define a new pricing tier and limits</p>
        </button>

        {/* Existing Packages */}
        {packages.map((pkg) => {
          const style = colorStyles[pkg.tier_color] || colorStyles.blue;
          
          return (
            <div 
              key={pkg.id} 
              className={`relative overflow-hidden border rounded-3xl p-8 flex flex-col min-h-[300px] transition-opacity ${!pkg.is_active ? 'opacity-50 grayscale' : ''} bg-gradient-to-br ${style}`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-serif text-sand-text">{pkg.name}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleActive(pkg.id, pkg.is_active)}
                    className="p-2 bg-white/40 rounded-full hover:bg-white/60 transition-colors text-sand-text"
                    title={pkg.is_active ? "Deactivate" : "Activate"}
                  >
                    {pkg.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => openEditModal(pkg)}
                    className="p-2 bg-white/40 rounded-full hover:bg-white/60 transition-colors text-sand-text"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-4xl font-bold text-sand-text mb-6">
                ₹{pkg.price.toLocaleString('en-IN')}
              </div>

              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">Package Includes</h4>
                <ul className="space-y-2">
                  {pkg.limits.split('\n').map((limit: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-sand-text/90">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <PackageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingPackage={editingPackage} 
      />
    </>
  );
}
