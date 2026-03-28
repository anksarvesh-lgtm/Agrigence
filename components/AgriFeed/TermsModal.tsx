
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, XCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept, onReject }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-stone-100 flex items-center gap-4 bg-green-50">
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Terms and Conditions</h2>
                <p className="text-sm text-green-700 font-medium">Platform: AgriFeed | Parent: agrigence.in</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 prose prose-stone max-w-none">
              <p className="text-stone-600 font-medium">Effective Date: March 10, 2026</p>
              <p>These Terms and Conditions govern the use of the <strong>AgriFeed platform</strong>, a research and discussion community hosted under <strong>agrigence.in/agri-feed</strong>. By accessing or using AgriFeed, users agree to comply with these terms.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">1. Purpose of the Platform</h3>
              <p>AgriFeed is an <strong>academic and knowledge-sharing platform</strong> designed for agricultural discussions, research collaboration, and innovation exchange.</p>
              <p>The platform is intended <strong>primarily for academic, educational, and research purposes</strong> including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sharing agricultural research insights</li>
                <li>Discussing farming practices and innovations</li>
                <li>Connecting researchers, farmers, students, and professionals</li>
                <li>Encaging knowledge exchange within the agriculture ecosystem</li>
              </ul>
              <p>AgriFeed is <strong>not intended for commercial marketing, political campaigning, or unrelated social media activities</strong>.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">2. Eligibility</h3>
              <p>To use AgriFeed, users must be at least <strong>16 years of age</strong>, provide accurate registration information, and use the platform for <strong>academic or professional agricultural purposes</strong>.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">3. User Registration</h3>
              <p>Access to AgriFeed requires <strong>registration and login</strong>. Users must provide accurate information including name, email, and institution.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">4. Acceptable Use</h3>
              <p>Users agree to use AgriFeed responsibly. Content unrelated to agriculture or academic discussion may be removed. Spam, harassment, and misleading information are strictly prohibited.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">5. Content Ownership</h3>
              <p>Users retain ownership of their content but grant Agrigence a non-exclusive license to display and store it within the platform.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">6. Academic Integrity</h3>
              <p>Users must cite sources, respect intellectual property, and avoid plagiarism.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">7. Moderation</h3>
              <p>Agrigence reserves the right to review, moderate, and remove content or suspend accounts that violate these terms.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">8. File Uploads</h3>
              <p>Uploaded files may be automatically deleted after 180 days for system performance. Users should keep backups.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">9. Privacy</h3>
              <p>User data is handled according to the Agrigence Privacy Policy.</p>

              <h3 className="text-lg font-bold text-stone-900 mt-6 mb-2">10. Limitation of Liability</h3>
              <p>AgriFeed is a knowledge-sharing platform. Agrigence is not responsible for the accuracy of user-generated content.</p>

              <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-sm text-stone-500 italic m-0">By clicking "Accept and Continue", you confirm that you have read, understood, and agreed to these Terms and Conditions.</p>
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-white transition-all"
              >
                <XCircle size={20} />
                Reject and Exit
              </button>
              <button
                onClick={onAccept}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
              >
                Accept and Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
