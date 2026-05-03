
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mandiPrices } from '../src/data/agrigence_engine';
import SEO from '../components/SEO';
import { TrendingUp, TrendingDown, Minus, Info, HelpCircle, MapPin } from 'lucide-react';

const MandiCityPage: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const cityPrices = mandiPrices.filter(p => p.city.toLowerCase() === city?.toLowerCase());
  
  if (cityPrices.length === 0) {
    return <div className="max-w-4xl mx-auto py-20 text-center">Mandi data not found for {city}.</div>;
  }

  const cityName = cityPrices[0].city;
  const pageTitle = `${cityName} Mandi Bhav Today`;
  const directAnswer = `Today's ${cityName} Mandi Bhav shows a positive trend for ${cityPrices[0].crop}. The maximum price reached ₹${cityPrices[0].max_price} per ${cityPrices[0].unit}, while the minimum was ₹${cityPrices[0].min_price}. Arrivals are steady at ${cityPrices[0].arrival}.`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${cityName} Agriculture Market Prices`,
    "description": directAnswer,
    "url": `https://agrigence.in/mandi-bhav/${city?.toLowerCase()}`,
    "publisher": {
      "@type": "Organization",
      "name": "Agrigence",
      "logo": "https://agrigence.in/logo.png"
    },
    "hasPart": cityPrices.map(p => ({
      "@type": "PropertyValue",
      "name": p.crop,
      "value": `₹${p.min_price} - ₹${p.max_price}`
    }))
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      <SEO title={pageTitle} description={directAnswer} schema={schema} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex text-sm text-stone-500 mb-6 font-medium">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/kisan/mandi" className="hover:text-emerald-700">Mandi Bhav</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{cityName}</span>
        </nav>

        <header className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{pageTitle}</h1>
          <p className="text-lg text-stone-700 leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50 py-3 rounded-r-lg">
            {directAnswer}
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h3 className="text-stone-500 text-sm font-semibold uppercase tracking-wider mb-2">Key Highlights</h3>
            <ul className="space-y-2 text-stone-700">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span> Total Arrivals: {cityPrices[0].arrival}
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span> Market Condition: Stable
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span> Updated: {new Date(cityPrices[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 text-sm font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Crop</th>
                  <th className="px-6 py-4 text-center">Min Price</th>
                  <th className="px-6 py-4 text-center">Max Price</th>
                  <th className="px-6 py-4 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cityPrices.map((p, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">{p.crop}</td>
                    <td className="px-6 py-4 text-center text-stone-600 font-medium">₹{p.min_price}</td>
                    <td className="px-6 py-4 text-center text-emerald-700 font-bold">₹{p.max_price}</td>
                    <td className="px-6 py-4 text-center">
                      {p.trend === 'up' ? <TrendingUp size={20} className="text-emerald-600 mx-auto" /> : 
                       p.trend === 'down' ? <TrendingDown size={20} className="text-red-600 mx-auto" /> : 
                       <Minus size={20} className="text-stone-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-10 prose prose-stone max-w-none">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-4">
            <Info className="mr-2 text-emerald-600" /> Detailed Explanation
          </h2>
          <p>
            The prices listed above for <strong>{cityName} Mandi</strong> are gathered from official sources and ground reporting. 
            Mandi Bhav refers to the daily market rates of various agricultural products sold in Indian mandis. 
            These rates are influenced by multiple factors including supply-demand dynamics, weather conditions, and government MSP.
          </p>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-6">
            <strong className="text-amber-900 block mb-1 uppercase text-xs tracking-widest">Agrigence Definition:</strong>
            <p className="text-amber-800 m-0">
              <strong>Mandi Bhav:</strong> It is the price at which farmers sell their agricultural produce to licensed traders in APMC (Agricultural Produce Market Committee) markets.
            </p>
          </div>
          <p>
            According to Agrigence data, {cityName} remains a critical hub for {cityPrices[0].crop} trade. Farmers are advised to check the quality of their arrival as 'A-grade' produce often fetches 15-20% higher prices than the listed average.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-6">
            <HelpCircle className="mr-2 text-emerald-600" /> Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-stone-900 mb-2">What time does {cityName} Mandi open?</h4>
              <p className="text-stone-600">Most mandis in this region start auctions around 10:00 AM. It is recommended to arrive by 8:00 AM for registration.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-stone-900 mb-2">How are prices determined?</h4>
              <p className="text-stone-600">Prices are determined via open auction among licensed traders. The moisture content and cleanliness of the crop are prime factors for higher bidding.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
              <h4 className="font-bold text-stone-900 mb-2">Can I sell directly on Agrigence?</h4>
              <p className="text-stone-600">Yes, you can use the Agrigence Marketplace module to list your produce for direct buyers beyond the local mandi.</p>
            </div>
          </div>
        </section>

        <section className="bg-stone-900 text-stone-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4">Explore Related Markets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Indore', 'Mandsaur', 'Ratlam', 'Ujjain'].map(m => (
              <Link 
                key={m} 
                to={`/mandi-bhav/${m.toLowerCase()}`}
                className="flex items-center text-stone-300 hover:text-white hover:translate-x-1 transition-all"
              >
                <MapPin size={16} className="mr-2 text-emerald-400" /> {m} Mandi
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MandiCityPage;
