
import React from 'react';
import { ArrowLeft, MoreVertical, Clock } from 'lucide-react';
import { ProviderOrder } from '../../../../types';

interface HeaderSectionProps {
    order: ProviderOrder;
    onBack: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ order, onBack }) => {
    return (
        <div className="relative h-72 md:h-80 w-full md:rounded-3xl overflow-hidden md:mt-6 shadow-sm">
            <img src={order.imageUrl} alt={order.foodName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-transparent to-stone-900/40"></div>
            
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <button onClick={onBack} className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors pointer-events-auto">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors pointer-events-auto">
                    <MoreVertical className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10 ${
                        order.status === 'pending_approval' ? 'bg-orange-500 text-white' :
                        order.status === 'claimed' ? 'bg-yellow-500 text-white' : 
                        order.status === 'waiting_provider' ? 'bg-purple-500 text-white' :
                        order.status === 'in_progress' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                    }`}>
                        {order.status === 'pending_approval' ? 'Butuh Persetujuan' : 
                         order.status === 'claimed' ? 'Menunggu Pengambilan' : 
                         order.status === 'waiting_provider' ? 'Relawan Menuju Lokasi' :
                         order.status === 'in_progress' ? 'Pesanan Diambil' : 'Selesai'}
                    </span>
                    <span className="px-3 py-1 bg-stone-800/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-500" /> Batas: 14:00 WIB
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg">
                        {String(order.quantity).includes('Porsi') ? order.quantity : `${order.quantity} Porsi`}
                    </span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md mb-1">{order.foodName}</h1>
                <p className="text-stone-300 text-sm font-medium line-clamp-1">{order.description}</p>
            </div>
        </div>
    );
};
