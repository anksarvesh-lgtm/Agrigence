import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookViewerProps {
  content: string;
}

const BookViewer: React.FC<BookViewerProps> = ({ content }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      calculatePages();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculatePages = () => {
    if (contentRef.current && containerRef.current) {
      // Temporarily remove transform to measure accurately
      contentRef.current.style.transform = 'translateX(0)';
      
      const scrollWidth = contentRef.current.scrollWidth;
      const clientWidth = containerRef.current.clientWidth;
      
      // The gap between columns
      const gap = 48; // 3rem
      
      // Calculate total pages based on container width + gap
      const pages = Math.ceil(scrollWidth / (clientWidth + gap));
      setTotalPages(Math.max(1, pages));
      
      // Ensure current page is within bounds
      setCurrentPage(prev => {
        const newPage = Math.min(prev, Math.max(0, pages - 1));
        updateTransform(newPage);
        return newPage;
      });
    }
  };

  // Recalculate when content changes
  useEffect(() => {
    // Small delay to allow images/fonts to load and layout to settle
    const timer = setTimeout(calculatePages, 100);
    return () => clearTimeout(timer);
  }, [content]);

  const updateTransform = (page: number) => {
    if (contentRef.current && containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      const gap = 48; // 3rem
      const moveAmount = page * (clientWidth + gap);
      contentRef.current.style.transform = `translateX(-${moveAmount}px)`;
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => {
        const next = prev + 1;
        updateTransform(next);
        return next;
      });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => {
        const next = prev - 1;
        updateTransform(next);
        return next;
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div 
        className="w-full relative bg-[#FDFCFB] rounded-lg shadow-xl border border-stone-200 overflow-hidden" 
        style={{ height: '70vh', minHeight: '600px' }}
      >
        <div className="w-full h-full px-10 py-12 md:px-16 md:py-16 relative">
          <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden"
          >
            <style>{`
              .book-content > * {
                break-inside: avoid;
              }
              .book-content p {
                break-inside: auto;
                text-align: justify;
                hyphens: auto;
              }
              .book-content img {
                max-height: 40vh;
                object-fit: contain;
                margin: 2rem auto;
                break-inside: avoid;
                break-after: avoid;
              }
              .book-content h1, .book-content h2, .book-content h3, .book-content h4 {
                break-inside: avoid;
                break-after: avoid;
                margin-top: 0;
              }
            `}</style>
            <div 
              ref={contentRef}
              className="book-content h-full transition-transform duration-500 ease-in-out prose prose-stone max-w-none font-serif text-stone-800 leading-loose text-lg"
              style={{
                columnCount: 1,
                columnGap: '3rem',
                columnFill: 'auto',
                height: '100%',
                wordWrap: 'break-word',
                width: '100%',
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between w-full mt-8 px-4">
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors font-bold text-xs uppercase tracking-widest shadow-sm"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        
        <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          Page {currentPage + 1} of {totalPages}
        </div>

        <button 
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-200 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors font-bold text-xs uppercase tracking-widest shadow-sm"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default BookViewer;
