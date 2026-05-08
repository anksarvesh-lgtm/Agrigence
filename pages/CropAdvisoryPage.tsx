
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { cropAdvisory } from '../src/data/agrigence_engine';
import SEO from '../components/SEO';
import { Sprout, TestTube2, CloudRain, Thermometer, Info, HelpCircle } from 'lucide-react';

const CropAdvisoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const crop = cropAdvisory.find(c => c.slug === slug);
  
  if (!crop) {
    return <div className="max-w-4xl mx-auto py-20 text-center">Crop advisory not found.</div>;
  }

  const pageTitle = `${crop.name} Farming Guide - Modern Advisory & Yield Support`;
  const directAnswer = `${crop.name} (${crop.scientific_name}) is a ${crop.season} crop that grows best in ${crop.soil_type}. For a successful yield, use a fertilizer ratio of ${crop.fertilizer} and follow a planting depth of ${crop.sowing_depth}.`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageTitle,
    "description": directAnswer,
    "image": "https://agrigence.in/crop-meta.jpg",
    "author": { "@type": "Organization", "name": "Agrigence Agronomy Team" },
    "publisher": { "@type": "Organization", "name": "Agrigence" },
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": crop.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      <SEO title={pageTitle} description={directAnswer} schema={schema} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex text-sm text-stone-500 mb-6 font-medium">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <span className="mx-2">/</span>
          <a href="https://kisan.agrigence.in" className="hover:text-emerald-700">Advisory</a>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{crop.name}</span>
        </nav>

        <header className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sprout size={150} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 z-10 relative">{pageTitle}</h1>
          <p className="text-lg text-stone-700 leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50 py-3 rounded-r-lg z-10 relative">
            {directAnswer}
          </p>
        </header>

        <section className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 text-center">
            <Thermometer className="mx-auto text-emerald-600 mb-2" size={24} />
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">Season</span>
            <span className="text-sm font-bold text-stone-800">{crop.season}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 text-center">
            <CloudRain className="mx-auto text-emerald-600 mb-2" size={24} />
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">Climate</span>
            <span className="text-sm font-bold text-stone-800">{crop.climate_req}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 text-center">
            <TestTube2 className="mx-auto text-emerald-600 mb-2" size={24} />
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">Soil pH</span>
            <span className="text-sm font-bold text-stone-800">6.5 - 7.5</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 text-center">
            <Sprout className="mx-auto text-emerald-600 mb-2" size={24} />
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold">Est. Yield</span>
            <span className="text-sm font-bold text-stone-800">{crop.yield}</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 mb-10 overflow-hidden">
          <div className="bg-stone-900 text-white p-6">
            <h2 className="text-xl font-bold">Technical Specifications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-stone-100">
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-stone-500 w-1/3">Scientific Name</td>
                  <td className="px-8 py-4 italic text-stone-900">{crop.scientific_name}</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-stone-500">Sowing Depth</td>
                  <td className="px-8 py-4 text-stone-900">{crop.sowing_depth}</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-stone-500">Row Spacing</td>
                  <td className="px-8 py-4 text-stone-900">{crop.spacing}</td>
                </tr>
                <tr className="hover:bg-stone-50 transition-colors">
                  <td className="px-8 py-4 font-bold text-stone-500">Fertilizer Dose</td>
                  <td className="px-8 py-4 text-emerald-700 font-bold">{crop.fertilizer}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-10 prose prose-stone max-w-none">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-4">
            <Info className="mr-2 text-emerald-600" /> Agrigence Expert Insights
          </h2>
          <p>
            According to Agrigence data, the success of <strong>{crop.name} cultivation</strong> highly depends on the quality of seeds and initial soil preparation. 
            Farmers should conduct a soil test at least 15 days before sowing to determine the exact nutrient requirement.
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <h4 className="text-sm uppercase font-bold text-stone-500 mb-3 tracking-widest">Crop Highlights</h4>
                <ul className="space-y-3">
                  {crop.highlights.map((h, i) => (
                    <li key={i} className="flex items-start text-stone-700 text-sm">
                      <span className="text-emerald-500 mr-3">✓</span> {h}
                    </li>
                  ))}
                </ul>
            </div>
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                <h4 className="text-sm uppercase font-bold text-stone-500 mb-3 tracking-widest">Recommended Tools</h4>
                <div className="space-y-4">
                    <a href="https://kisan.agrigence.in/tools/fertilizer" className="block text-emerald-800 font-bold hover:underline">• Fertilizer Calculator</a>
                    <a href="https://kisan.agrigence.in/tools/yield" className="block text-emerald-800 font-bold hover:underline">• Yield Estimator</a>
                    <a href="https://kisan.agrigence.in/tools/seed" className="block text-emerald-800 font-bold hover:underline">• Seed Rate Planner</a>
                </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-6">
            <HelpCircle className="mr-2 text-emerald-600" /> FAQ: Common Questions about {crop.name}
          </h2>
          <div className="space-y-4">
            {crop.faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-stone-900 mb-2">{faq.q}</h4>
                <p className="text-stone-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-stone-200 pt-10">
            <p className="text-center text-stone-400 text-xs">
                © 2024 Agrigence Agriculture Platform. For citable data usage, reference our dataset API.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default CropAdvisoryPage;
