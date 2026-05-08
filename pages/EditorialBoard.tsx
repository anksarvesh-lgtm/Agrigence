import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Mail, MapPin, BookOpen, AlertCircle, Building, Globe } from 'lucide-react';
import { EditorialMember } from '../types';
import SEO from '../components/SEO';

const OrcidIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
    <path d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z" fill="#A6CE39"/>
    <path d="M86.3,186.2H70.9V79.1h15.4V186.2z M108.9,79.1h-0.3c-23.7,0-41.5,17-41.5,41.9c0,24.1,17.4,41.8,40.8,41.8h0.2 c24.2,0,41.7-17.5,41.7-42.1C150.3,96.3,133.1,79.1,108.9,79.1z M108.8,149.3c-14.8,0-23.8-11.8-23.8-28.5c0-16.5,8.8-28.3,23.8-28.3 c14.8,0,23.8,11.8,23.8,28.5C132.6,137.5,123.6,149.3,108.8,149.3z M206.9,132.6c0,32.2-25.1,53.6-58.8,53.6h-24.1V79.1h25.4 C182.2,79.1,206.9,98.9,206.9,132.6z M189.6,132.6c0-23.7-15.6-38.3-37.4-38.3h-10v76.5h8.9C173.2,170.8,189.6,155.5,189.6,132.6z M78.6,44.3c-5.3,0-9.6,4.3-9.6,9.6c0,5.3,4.3,9.6,9.6,9.6c5.3,0,9.6-4.3,9.6-9.6C88.2,48.6,83.9,44.3,78.6,44.3z" fill="#FFFFFF"/>
  </svg>
);

const AcademicMemberCard: React.FC<{ member: EditorialMember }> = ({ member }) => {
  return (
    <div className="bg-white border text-left border-stone-200 shadow-sm rounded-none p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
      <div className="shrink-0">
        <div className="w-28 h-32 bg-stone-100 border border-stone-300 overflow-hidden shadow-sm">
          <img 
            src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
            alt={member.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="border-b border-stone-200 pb-2">
          <h3 className="text-xl font-serif font-bold text-blue-900">{member.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">{member.designation}</p>
            {member.profession && (
              <>
                <span className="text-stone-300">|</span>
                <p className="text-sm text-stone-600 italic font-medium">{member.profession}</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-stone-700">
          {member.department && (
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span><strong>Department:</strong> {member.department}</span>
            </div>
          )}
          
          {member.institution && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span><strong>Institution:</strong> {member.institution}</span>
            </div>
          )}

          {member.country && (
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span><strong>Country:</strong> {member.country}</span>
            </div>
          )}

          {member.expertise && (
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span><strong>Research Area:</strong> {member.expertise}</span>
            </div>
          )}
        </div>

        <div className="pt-3 flex flex-wrap gap-4 border-t border-stone-100">
          {member.orcid && (
            <a href={member.orcid.startsWith('http') ? member.orcid : `https://orcid.org/${member.orcid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-green-700 transition-colors">
              <OrcidIcon /> ORCID Profile
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-blue-700 transition-colors">
              <Mail className="w-4 h-4" /> {member.email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const EditorialBoard: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const m = await mockBackend.getMembers();
        const activeMembers = m.filter(member => member.isEnabled !== false).sort((a, b) => a.order - b.order);
        setMembers(activeMembers);
      } catch (err) {
        console.error("Error loading editorial board", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const categories = [
    { title: "Editor-in-Chief", filter: (m: EditorialMember) => m.designation === 'Editor-in-Chief' },
    { title: "Managing Editor", filter: (m: EditorialMember) => m.designation === 'Managing Editor' },
    { title: "Associate Editors", filter: (m: EditorialMember) => m.designation === 'Associate Editor' },
    { title: "Editorial Board Members", filter: (m: EditorialMember) => m.designation === 'Editorial Board Member' },
    { title: "Advisory Board Members", filter: (m: EditorialMember) => m.designation === 'Advisory Board' || m.designation === 'Advisory Board Member' },
    { title: "Reviewers", filter: (m: EditorialMember) => m.designation === 'Reviewer' }
  ];

  return (
    <div className="min-h-screen bg-white pb-32 font-sans text-stone-800">
      <SEO 
        title="Editorial Board | Agrigence Journal"
        description="Editorial Board of the Agrigence Journal. A scholarly platform for agricultural research and innovation."
      />
      
      {/* Structural Academic Header */}
      <div className="bg-blue-900 border-b-[6px] border-green-700 py-16 px-6 shadow-md">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-wide">Editorial Board</h1>
          <p className="text-blue-100 text-lg font-serif italic">
            Agrigence Journal of Agricultural Research &amp; Innovation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl mt-12 bg-white">
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 border border-stone-200">
            <AlertCircle className="mx-auto text-stone-400 mb-4 w-12 h-12" />
            <h3 className="text-lg font-serif text-stone-600">Editorial board members will be updated shortly.</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryMembers = members.filter(category.filter);
              if (categoryMembers.length === 0) return null;

              return (
                <div key={category.title} className="bg-white">
                  <h2 className="text-2xl font-serif font-bold text-blue-900 border-b-2 border-green-700 pb-2 mb-6">
                    {category.title}
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {categoryMembers.map(member => (
                      <AcademicMemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Catch-all for any other unmapped roles */}
            {(() => {
              const mappedNames = categories.map(c => c.title);
              const mappedDesignations = ['Editor-in-Chief', 'Managing Editor', 'Associate Editor', 'Editorial Board Member', 'Advisory Board', 'Reviewer'];
              const unmapped = members.filter(m => !mappedDesignations.includes(m.designation));
              
              if (unmapped.length === 0) return null;
              
              return (
                <div className="bg-white">
                  <h2 className="text-2xl font-serif font-bold text-blue-900 border-b-2 border-green-700 pb-2 mb-6">
                    Other Board Members
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {unmapped.map(member => (
                      <AcademicMemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorialBoard;
