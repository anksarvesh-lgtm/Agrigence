import React from 'react';
import SEO from '../components/SEO';

const Copyright: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title="Copyright Notice | Agrigence"
        description="Copyright notice for Agrigence.in - Intellectual property rights and usage policies."
      />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-serif font-bold text-agri-darkGreen mb-2">COPYRIGHT NOTICE</h1>
        <p className="text-stone-500 mb-8 text-sm font-mono">© 2026 Agrigence.in. All Rights Reserved.</p>

        <div className="space-y-6 text-stone-700 leading-relaxed">
          <p>
            All content available on Agrigence.in including but not limited to text, articles, research materials, graphics, logos, infographics, videos, photographs, illustrations, UI/UX designs, databases, source code, documents, educational resources, branding assets, and digital media are the exclusive intellectual property of Agrigence unless otherwise stated.
          </p>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">This content is protected under:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The Copyright Act, 1957 (India)</li>
              <li>The Trade Marks Act, 1999 (India)</li>
              <li>International Intellectual Property and Copyright Laws</li>
              <li>Berne Convention for the Protection of Literary and Artistic Works</li>
            </ul>
          </section>

          <p className="font-semibold text-stone-800">
            Unauthorized copying, reproduction, redistribution, modification, republication, screen recording, scraping, mirroring, AI training usage, automated extraction, commercial exploitation, or transmission of any material from Agrigence.in in any form or by any means without prior written permission is strictly prohibited.
          </p>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">Users are specifically prohibited from:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Republishing Agrigence content on websites or social platforms</li>
              <li>Using graphics, infographics, or reports without attribution and permission</li>
              <li>Copying research or educational materials for commercial use</li>
              <li>Scraping or extracting website data using bots or automated systems</li>
              <li>Using Agrigence content for AI model training, datasets, or machine learning purposes</li>
              <li>Reverse engineering platform features or proprietary systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">Agrigence reserves all rights to:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Issue DMCA takedown notices</li>
              <li>Initiate legal proceedings</li>
              <li>Claim damages and compensation</li>
              <li>Suspend or block unauthorized access</li>
              <li>Enforce intellectual property rights under applicable laws</li>
            </ul>
          </section>

          <div className="mt-8 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-700 font-medium mb-2">
              For permissions, licensing, partnerships, or copyright-related concerns, contact:
            </p>
            <a href="mailto:agrigence@gmail.com" className="text-agri-green font-bold hover:underline">agrigence@gmail.com</a>
            
            <p className="text-sm text-stone-500 mt-4">
              Website: <a href="https://www.agrigence.in" className="hover:underline">https://www.agrigence.in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
