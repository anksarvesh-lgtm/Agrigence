
import React from 'react';
import { BookOpen } from 'lucide-react';
import SEO from '../components/SEO';

const AimScope: React.FC = () => {
  return (
    <div className="bg-agri-bg min-h-screen py-20">
      <SEO 
        title="Aim & Scope | Agrigence"
        description="Learn about the aim and scope of Agrigence Journal of Agriculture & Allied Sciences."
      />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-stone-200">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-agri-secondary/10 flex items-center justify-center text-agri-secondary">
                    <BookOpen size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-agri-primary">Aim & Scope</h1>
            </div>

            <div className="prose prose-lg text-stone-600 leading-relaxed space-y-6">
                <p>
                    Agrigence Journal of Agriculture & Allied Sciences aims to provide a professional academic platform for researchers, academicians, scientists, students, extension professionals, policymakers, and industry experts to publish and disseminate high-quality scientific research and innovative developments in the field of agriculture and allied sciences. The journal is committed to promoting interdisciplinary research, scientific advancement, sustainable agricultural practices, and knowledge exchange at national and international levels.
                </p>

                <p>
                    The journal encourages the publication of original research articles, review papers, short communications, technical notes, case studies, and innovative research findings that contribute to the advancement of agricultural sciences and rural development.
                </p>

                <h3 className="text-2xl font-bold text-agri-primary pt-6">Scope of the Journal includes, but is not limited to:</h3>

                <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
                    {[
                        "Agriculture and Agronomy",
                        "Horticulture and Floriculture",
                        "Forestry and Agroforestry",
                        "Soil Science and Soil Management",
                        "Plant Pathology and Plant Protection",
                        "Entomology and Pest Management",
                        "Agricultural Engineering and Technology",
                        "Agricultural Biotechnology",
                        "Seed Science and Technology",
                        "Genetics and Plant Breeding",
                        "Environmental Science and Climate Change",
                        "Water Resource Management and Irrigation",
                        "Organic Farming and Sustainable Agriculture",
                        "Precision Agriculture and Smart Farming",
                        "Agribusiness Management and Agricultural Economics",
                        "Food Science and Post-Harvest Technology",
                        "Animal Husbandry and Veterinary Sciences",
                        "Fisheries and Aquaculture",
                        "Rural Development and Agricultural Extension",
                        "Agri-Innovation, Digital Agriculture, and Emerging Technologies"
                    ].map((item, index) => (
                        <li key={index} className="flex gap-3 items-start">
                            <span className="text-agri-secondary font-bold">✓</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <p className="pt-6">
                    The journal seeks to promote ethical, evidence-based, and impactful research that supports scientific progress, agricultural sustainability, food security, rural empowerment, and technological innovation in the agriculture sector worldwide.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AimScope;
