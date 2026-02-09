import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-serif font-bold text-agri-darkGreen mb-2">Terms and Conditions</h1>
        <p className="text-stone-500 mb-8 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Agrigence website ("Platform"), you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">2. User Eligibility and Responsibilities</h2>
            <p>
              You must be at least 18 years of age to use this Platform or do so under the supervision of a legal guardian. You are responsible for ensuring that all information provided during registration or subscription is accurate and up-to-date. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">3. Intellectual Property Rights</h2>
            <p>
              The content, organization, graphics, design, compilation, and other matters related to the Platform are protected under applicable Indian copyrights, trademarks, and other proprietary (including but not limited to intellectual property) rights. The copying, redistribution, use, or publication by you of any such matters or any part of the Platform, except as allowed by these Terms, is strictly prohibited. Agrigence retains all ownership rights to the content published on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">4. Use of Website Content</h2>
            <p>
              Content provided on Agrigence, including articles, journals, and educational materials, is for informational and educational purposes only. You may access and download materials for personal, non-commercial use. Any reproduction, transmission, or distribution of the content for commercial purposes without express written consent from Agrigence is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">5. User Conduct</h2>
            <p>
              Users agree not to use the Platform for any unlawful purpose. You agree not to post or transmit any material that is infringing, threatening, false, misleading, abusive, harassing, libelous, defamatory, vulgar, obscene, scandalous, inflammatory, pornographic, or profane. Agrigence reserves the right to terminate accounts that violate these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">6. Event Registrations and Services</h2>
            <p>
              For paid services, including subscriptions, workshop registrations, and conference fees, you agree to pay all charges at the prices then in effect for your purchases. All transactions are processed through secure third-party payment gateways. Agrigence is not responsible for any errors or delays caused by third-party banking systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">7. Refund and Cancellation Policy</h2>
            <p>
              Subscription cancellations are allowed only if no content (articles/journals) has been submitted or downloaded during the active period. Refunds for workshops or events are subject to the specific cancellation policy mentioned at the time of registration. In general, requests for refunds must be made in writing at least 7 days prior to the event date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">8. Limitation of Liability</h2>
            <p>
              Agrigence and its affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Platform or for the cost of procurement of substitute services. We do not guarantee that the Platform will be error-free or uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">9. Force Majeure</h2>
            <p>
              Agrigence shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond Agrigence's reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation, acts of God, war, or government laws/regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">10. Governing Law and Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Chandauli, Uttar Pradesh.
            </p>
          </section>

          <div className="mt-8 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              If you have any questions regarding these Terms, please contact us at <a href="mailto:agrigence@gmail.com" className="text-agri-green hover:underline">agrigence@gmail.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;