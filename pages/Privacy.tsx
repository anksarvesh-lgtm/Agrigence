import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
        <h1 className="text-3xl font-serif font-bold text-agri-darkGreen mb-2">Privacy Policy</h1>
        <p className="text-stone-500 mb-8 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-stone-700 leading-relaxed">
          <section>
            <p>
              At Agrigence, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to safeguard your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">1. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of personal information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Identity Information:</strong> Name, email address, phone number, mailing address, and professional details (occupation, institution).</li>
              <li><strong>Account Credentials:</strong> Usernames and passwords created for accessing our services.</li>
              <li><strong>Transaction Data:</strong> Details of payments and subscriptions purchased (excluding sensitive financial data like CVV, which is handled by payment processors).</li>
              <li><strong>Usage Data:</strong> Information on how you access and use the website, including IP address, browser type, and device information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">2. How We Use Your Data</h2>
            <p className="mb-2">The information we collect is used for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our services, including magazine subscriptions and article submissions.</li>
              <li>To communicate with you regarding updates, newsletters, events, and workshops.</li>
              <li>To process transactions and manage your subscription account.</li>
              <li>To improve our website functionality and user experience based on usage patterns.</li>
              <li>To comply with legal obligations and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">4. Data Protection Measures</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">5. Data Sharing and Disclosure</h2>
            <p>
              Agrigence does not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners, trusted affiliates, and advertisers. We may share your information with third-party service providers (such as payment gateways or email services) only to the extent necessary for them to perform their services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of any incorrect or incomplete data.</li>
              <li>Request deletion of your personal account and data, subject to legal retention obligations.</li>
              <li>Opt-out of marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">7. Third-Party Links</h2>
            <p>
              Our website may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content or practices of any third-party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at: <a href="mailto:agrigence@gmail.com" className="text-agri-green hover:underline">agrigence@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;