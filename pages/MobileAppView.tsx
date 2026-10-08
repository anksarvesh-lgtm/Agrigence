import React, { useState } from 'react';
import { GovSchemes } from './KisanHub/GovSchemes';
import FarmerConnect from './FarmerConnect';
import { Landmark, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';

const MobileAppView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'schemes' | 'connect'>('schemes');

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            <SEO title="Mobile App Data" description="Govt Schemes and Farmer Connect for Mobile View" />
            
            {/* Header */}
            <div className="bg-agri-green text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold font-serif">Agrigence App</h1>
            </div>

            {/* Content Area */}
            <div className="p-4 relative">
                {activeTab === 'schemes' ? (
                    <div className="mb-10">
                        <h2 className="text-2xl font-serif text-agri-green mb-4">Government Schemes</h2>
                        <GovSchemes hideBack={true} />
                    </div>
                ) : (
                    <div className="mb-10">
                        <h2 className="text-2xl font-serif text-agri-green mb-4">Farmer Connect</h2>
                        <FarmerConnect hideHeader={true} />
                    </div>
                )}
            </div>

            {/* Bottom App Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                <button 
                    onClick={() => setActiveTab('schemes')}
                    className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'schemes' ? 'text-agri-green' : 'text-gray-400'}`}
                >
                    <Landmark size={24} className={activeTab === 'schemes' ? 'fill-agri-green/20' : ''} />
                    <span className="text-[10px] font-bold">Schemes</span>
                </button>
                <button 
                    onClick={() => setActiveTab('connect')}
                    className={`flex flex-col items-center gap-1 flex-1 ${activeTab === 'connect' ? 'text-agri-green' : 'text-gray-400'}`}
                >
                    <MessageCircle size={24} className={activeTab === 'connect' ? 'fill-agri-green/20' : ''} />
                    <span className="text-[10px] font-bold">Ask/Reply</span>
                </button>
            </div>
        </div>
    );
};

export default MobileAppView;
