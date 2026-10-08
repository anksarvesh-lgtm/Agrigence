
import React, { useState } from 'react';
import { Mail, MessageCircle, ArrowRight } from 'lucide-react';

const Consultation: React.FC = () => {
  const [formData, setFormData] = useState({
    type: 'Academic Support',
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getWhatsAppLink = () => {
    const text = `*Consultation Request*\nType: ${formData.type}\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
    return `https://wa.me/919452571317?text=${encodeURIComponent(text)}`;
  };

  const getMailLink = () => {
    const subject = `Consultation Request: ${formData.type}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\nType: ${formData.type}\n\nMessage:\n${formData.message}`;
    return `mailto:agrigence@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-agri-bg">
       
       <div className="bg-[#0F392B] text-white py-16 px-6 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
             <img 
               src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop" 
               alt="Growth and Connection" 
               className="w-full h-full object-cover opacity-20"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#0F392B]/80 to-[#0F392B]"></div>
          </div>

          <div className="container mx-auto text-center relative z-10">
             <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Expert Consultation</h1>
             <p className="text-xl text-stone-300 font-light">Get professional advice tailored to your agricultural needs.</p>
          </div>
       </div>

       <div className="container mx-auto px-6 py-16 -mt-10">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-premium border border-stone-100 overflow-hidden relative z-20">
          
          <div className="p-10 md:p-14">
            <form className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">I need consultation for</label>
                <div className="relative">
                   <select 
                     name="type"
                     value={formData.type} 
                     onChange={handleInputChange}
                     className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0F392B] outline-none appearance-none font-serif text-lg text-[#0F392B]"
                   >
                     <option>Academic Support</option>
                     <option>Crop Management</option>
                     <option>Industrial Strategy</option>
                     <option>Research Guidance</option>
                     <option>Other</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0F392B] outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0F392B] outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Details</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#0F392B] outline-none h-40 transition-all"
                  placeholder="Please describe your query in detail so we can connect you with the right expert..."
                ></textarea>
              </div>

              <div className="border-t border-stone-100 pt-8">
                <p className="text-center text-stone-600 mb-6 font-medium">Choose your preferred connection method:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <a 
                    href={getWhatsAppLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-3 p-5 rounded-xl transition-all ${formData.name && formData.message ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:-translate-y-1 cursor-pointer' : 'bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none'}`}
                  >
                    <MessageCircle size={24} />
                    <span className="font-bold">Connect via WhatsApp</span>
                  </a>
                  <a 
                    href={getMailLink()}
                    className={`flex items-center justify-center gap-3 p-5 rounded-xl transition-all ${formData.name && formData.message ? 'bg-[#0F392B] hover:bg-[#0b221a] text-white shadow-xl hover:-translate-y-1 cursor-pointer' : 'bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none'}`}
                  >
                    <Mail size={24} />
                    <span className="font-bold">Send Email Request</span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="text-center mt-8 text-xs text-stone-400 max-w-lg mx-auto">
          * Professional consultation fees may apply based on the complexity and duration of the required service. Our team will inform you beforehand.
        </div>
      </div>
    </div>
  );
};

export default Consultation;
