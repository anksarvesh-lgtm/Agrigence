
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemes } from '../src/data/agrigence_engine';
import SEO from '../components/SEO';
import { CheckCircle2, ClipboardIcon, ExternalLink, HelpCircle, BookOpen } from 'lucide-react';

const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const scheme = schemes.find(s => s.slug === slug);
  
  if (!scheme) {
    return <div className="max-w-4xl mx-auto py-20 text-center">Scheme not found.</div>;
  }

  const pageTitle = `${scheme.name} - Complete Guide (Aadhar, Eligibility & Apply)`;
  const directAnswer = `The ${scheme.name} is a national initiative aimed at providing ${scheme.benefits.substring(0, 100)}. Eligible farmers receive financial assistance and support to ensure sustainable farming practices across India.`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageTitle,
    "description": directAnswer,
    "image": "https://agrigence.in/scheme-meta.jpg",
    "author": { "@type": "Organization", "name": "Agrigence Editor" },
    "publisher": { "@type": "Organization", "name": "Agrigence" },
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": scheme.faqs.map(f => ({
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
          <Link to="/kisan/schemes" className="hover:text-emerald-700">Gov Schemes</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{scheme.name}</span>
        </nav>

        <header className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{pageTitle}</h1>
          <p className="text-lg text-stone-700 leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50 py-3 rounded-r-lg">
            {directAnswer}
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 h-full">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
              <CheckCircle2 className="mr-2 text-emerald-600" /> Key Highlights
            </h3>
            <ul className="space-y-4">
              {scheme.highlights.map((h, i) => (
                <li key={i} className="flex items-start text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 mr-3 shrink-0"></span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-emerald-900 text-emerald-50 p-8 rounded-2xl shadow-lg border border-emerald-800 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Fact Check</h3>
              <div className="space-y-4 opacity-90">
                <div>
                  <span className="block text-xs uppercase tracking-widest text-emerald-400 mb-1">Eligibility</span>
                  <p className="font-semibold">{scheme.eligibility}</p>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-widest text-emerald-400 mb-1">Core Benefit</span>
                  <p className="font-semibold">{scheme.benefits}</p>
                </div>
              </div>
            </div>
            <a 
              href={scheme.official_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all"
            >
              Apply on Official Website <ExternalLink size={18} className="ml-2" />
            </a>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-10 overflow-hidden">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-6">
            <ClipboardIcon className="mr-2 text-emerald-600" /> Application & Eligibility
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-4 font-bold text-stone-600 w-1/3">Target Farmers</td>
                  <td className="py-4 text-stone-800">{scheme.eligibility}</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-stone-600">Application Mode</td>
                  <td className="py-4 text-stone-800">{scheme.application_process}</td>
                </tr>
                <tr>
                  <td className="py-4 font-bold text-stone-600">Verification Required</td>
                  <td className="py-4 text-stone-800">Aadhar card, Bank account details, Land record proof</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-10 prose prose-stone max-w-none">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-4">
            <BookOpen className="mr-2 text-emerald-600" /> Scheme Overview
          </h2>
          <p>
            According to Agrigence data, the <strong>{scheme.name}</strong> has benefitted over millions of farmers.
            The primary objective is to ensure that farmers have sufficient financial liquidity to purchase seeds, fertilizers, and equipment.
          </p>
          <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 my-6">
            <p className="italic text-emerald-900 m-0 leading-relaxed font-medium">
              "This scheme represents a shift towards Direct Benefit Transfer (DBT) in Indian agriculture, reducing middlemen and ensuring transparency."
              <span className="block mt-2 text-emerald-600 font-bold">— Agrigence Analyst</span>
            </p>
          </div>
          <p>
            {scheme.benefits} To apply, users must ensure their Aadhar is linked with their bank account and land records. 
            The process is primarily digital but can be initiated through local Common Service Centers (CSCs).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="flex items-center text-2xl font-bold text-stone-900 mb-6">
            <HelpCircle className="mr-2 text-emerald-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {scheme.faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-stone-900 mb-2">{faq.q}</h4>
                <p className="text-stone-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
          <h3 className="text-xl font-bold mb-4">Other Important Schemes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['PM-Fasal Bima Yojana', 'Kisan Credit Card (KCC)'].map(s => (
              <div key={s} className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all border border-stone-100 cursor-pointer">
                <span className="font-semibold text-emerald-800">{s}</span>
                <p className="text-xs text-stone-500 mt-1">Check eligibility and detailed guide →</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchemeDetailPage;
