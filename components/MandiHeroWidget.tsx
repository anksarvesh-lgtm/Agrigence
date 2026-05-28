import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface MandiRecord {
  market: string;
  commodity: string;
  modal_price: string;
  district: string;
  state: string;
}

export const MandiHeroWidget: React.FC = () => {
    const [records, setRecords] = useState<MandiRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [district, setDistrict] = useState('Detecting...');

    useEffect(() => {
        const fetchLocalMandi = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Simple bounding box logic for core audience
                    let detectedDistrict = "Chandauli";
                    if (lat > 26 && lat < 28 && lon > 76 && lon < 78) {
                        detectedDistrict = "Alwar";
                    } else if (lat > 24 && lat < 26 && lon > 82 && lon < 84) {
                        detectedDistrict = "Chandauli";
                    } else {
                        // Attempt reverse geocode to get district
                        try {
                           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                           const geo = await res.json();
                           detectedDistrict = geo.address.state_district || geo.address.city || "Chandauli";
                        } catch (e) {
                           detectedDistrict = "Chandauli";
                        }
                    }
                    
                    setDistrict(detectedDistrict);
                    fetchFromGov(detectedDistrict);
                }, () => {
                    // Fallback
                    setDistrict("Chandauli");
                    fetchFromGov("Chandauli");
                });
            } else {
                setDistrict("Chandauli");
                fetchFromGov("Chandauli");
            }
        };

        const fetchFromGov = async (dist: string) => {
            try {
                // Using the exact API structure requested
                const API_KEY = import.meta.env.VITE_GOV_DATA_API_KEY || '';
                const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[district]=${encodeURIComponent(dist)}&limit=3`;
                
                const response = await fetch(url);
                const data = await response.json();
                if (data.records) {
                    setRecords(data.records);
                }
            } catch (error) {
                console.error("Mandi fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocalMandi();
    }, []);

    if (loading) return (
        <div className="bg-white/90 backdrop-blur-md border-l-4 border-emerald-600 p-4 rounded-xl shadow-lg min-w-[240px] flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={24} />
        </div>
    );

    if (records.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-md border-l-4 border-emerald-600 p-4 rounded-xl shadow-lg min-w-[240px]"
        >
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest mb-3 opacity-80">
                <MapPin size={14} className="text-emerald-600" />
                Local Market: <span className="text-stone-900">{records[0].market || district}</span>
            </div>
            
            <div className="space-y-3">
                {records.map((r, i) => (
                    <div key={i} className="flex justify-between items-center group">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase leading-none mb-1">{r.commodity}</span>
                            <span className="text-sm font-mono font-bold text-stone-800">₹{parseFloat(r.modal_price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${i % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {i % 2 === 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center text-[9px] font-bold text-stone-400 uppercase tracking-tighter">
                <span>Updated Live</span>
                <span className="text-emerald-600">data.gov.in</span>
            </div>
        </motion.div>
    );
};
