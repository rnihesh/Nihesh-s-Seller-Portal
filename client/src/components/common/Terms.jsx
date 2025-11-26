import React, { useState } from "react";
import "./Terms.css";

function Terms() {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div className="terms-container">
      <div className="container py-5">
        <h1
          className="text-center mb-4"
          style={{ color: "var(--accent-color)" }}
        >
          Legal Information
        </h1>

        {/* Tab Navigation */}
        <div className="terms-tabs mb-4">
          <button
            className={`terms-tab ${activeTab === "terms" ? "active" : ""}`}
            onClick={() => setActiveTab("terms")}
          >
            Terms & Conditions
          </button>
          <button
            className={`terms-tab ${activeTab === "privacy" ? "active" : ""}`}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy Policy
          </button>
        </div>

        {/* Terms & Conditions Content */}
        {activeTab === "terms" && (
          <div className="terms-content">
            <h2>Terms and Conditions</h2>
            <p className="last-updated">Last Updated: November 26, 2025</p>

            <section>
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using Nihesh's Seller Portal (the "Service"),
                you accept and agree to be bound by the terms and provision of
                this agreement. If you do not agree to these Terms and
                Conditions, please do not use this Service.
              </p>
            </section>

            <section>
              <h3>2. Description of Service</h3>
              <p>
                Nihesh's Seller Portal is a web-based inventory management
                platform that allows sellers to manage their products, track
                inventory, and analyze sales data. The Service provides tools
                for product listing, inventory tracking, and basic analytics.
              </p>
            </section>

            <section>
              <h3>3. User Accounts</h3>
              <p>
                To use certain features of the Service, you must register for an
                account. You agree to:
              </p>
              <ul>
                <li>
                  Provide accurate, current, and complete information during
                  registration
                </li>
                <li>Maintain the security of your password and account</li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
                <li>
                  Be responsible for all activities that occur under your
                  account
                </li>
              </ul>
            </section>

            <section>
              <h3>4. User Responsibilities</h3>
              <p>As a user of the Service, you agree to:</p>
              <ul>
                <li>Use the Service only for lawful purposes</li>
                <li>
                  Not upload malicious code or engage in activities that could
                  harm the Service
                </li>
                <li>
                  Not attempt to gain unauthorized access to any part of the
                  Service
                </li>
                <li>
                  Ensure that your product listings comply with all applicable
                  laws and regulations
                </li>
                <li>Maintain accurate inventory and product information</li>
              </ul>
            </section>

            <section>
              <h3>5. Product Listings</h3>
              <p>
                You are solely responsible for the accuracy and legality of your
                product listings. You warrant that:
              </p>
              <ul>
                <li>You have the right to sell the products you list</li>
                <li>
                  Your product descriptions are accurate and not misleading
                </li>
                <li>
                  Your products do not infringe on any third-party intellectual
                  property rights
                </li>
                <li>
                  Your products comply with all applicable laws and regulations
                </li>
              </ul>
            </section>

            <section>
              <h3>6. Data Storage and Backup</h3>
              <p>
                While we make reasonable efforts to maintain the Service and
                your data, we recommend that you maintain your own backup copies
                of any important data. We are not responsible for any loss or
                corruption of data, or any costs or expenses associated with
                backup or restoration of data.
              </p>
            </section>

            <section>
              <h3>7. Intellectual Property</h3>
              <p>
                The Service and its original content, features, and
                functionality are owned by Nihesh's Seller Portal and are
                protected by international copyright, trademark, patent, trade
                secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3>8. Third-Party Services</h3>
              <p>
                The Service may integrate with third-party services (such as
                Clerk for authentication, Cloudinary for image storage, and
                Google Gemini for AI features). Your use of these third-party
                services is subject to their respective terms of service and
                privacy policies.
              </p>
            </section>

            <section>
              <h3>9. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, Nihesh's
                Seller Portal shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, or any loss of
                profits or revenues, whether incurred directly or indirectly, or
                any loss of data, use, goodwill, or other intangible losses
                resulting from:
              </p>
              <ul>
                <li>Your use or inability to use the Service</li>
                <li>
                  Any unauthorized access to or use of our servers and/or any
                  personal information stored therein
                </li>
                <li>
                  Any interruption or cessation of transmission to or from the
                  Service
                </li>
                <li>
                  Any bugs, viruses, or other harmful code that may be
                  transmitted through the Service
                </li>
              </ul>
            </section>

            <section>
              <h3>10. Disclaimer of Warranties</h3>
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis
                without any warranties of any kind, either express or implied,
                including but not limited to warranties of merchantability,
                fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section>
              <h3>11. Modifications to Service</h3>
              <p>
                We reserve the right to modify or discontinue, temporarily or
                permanently, the Service (or any part thereof) with or without
                notice. You agree that we shall not be liable to you or any
                third party for any modification, suspension, or discontinuance
                of the Service.
              </p>
            </section>

            <section>
              <h3>12. Termination</h3>
              <p>
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice or liability, for any
                reason, including but not limited to breach of these Terms. Upon
                termination, your right to use the Service will immediately
                cease.
              </p>
            </section>

            <section>
              <h3>13. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which the Service operator
                is located, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h3>14. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify users of any material changes by posting the new Terms on
                this page and updating the "Last Updated" date. Your continued
                use of the Service after such modifications constitutes your
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h3>15. Contact Information</h3>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p>Email: nihesh.dev@gmail.com</p>
            </section>
          </div>
        )}

        {/* Privacy Policy Content */}
        {activeTab === "privacy" && (
          <div className="terms-content">
            <h2>Privacy Policy</h2>
            <p className="last-updated">Last Updated: November 26, 2025</p>

            <section>
              <h3>1. Introduction</h3>
              <p>
                Nihesh's Seller Portal ("we", "our", or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our Service.
              </p>
            </section>

            <section>
              <h3>2. Information We Collect</h3>
              <h4>2.1 Personal Information</h4>
              <p>When you register for an account, we collect:</p>
              <ul>
                <li>First and last name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Company name</li>
              </ul>

              <h4>2.2 Product Information</h4>
              <p>When you create product listings, we collect:</p>
              <ul>
                <li>Product names, descriptions, and categories</li>
                <li>Product images</li>
                <li>Pricing and quantity information</li>
              </ul>

              <h4>2.3 Usage Information</h4>
              <p>
                We automatically collect certain information about your device
                and how you interact with the Service:
              </p>
              <ul>
                <li>
                  Device information (type, operating system, browser type)
                </li>
                <li>IP address and geographic location</li>
                <li>Log data (access times, pages viewed, actions taken)</li>
                <li>Network information (connection type, RTT)</li>
                <li>
                  Performance metrics (device memory, hardware concurrency)
                </li>
              </ul>
            </section>

            <section>
              <h3>3. How We Use Your Information</h3>
              <p>We use the collected information for various purposes:</p>
              <ul>
                <li>To provide and maintain the Service</li>
                <li>To authenticate your identity and manage your account</li>
                <li>To process and store your product listings</li>
                <li>
                  To send you verification codes and important service
                  notifications
                </li>
                <li>To analyze usage patterns and improve the Service</li>
                <li>To provide customer support</li>
                <li>To detect and prevent fraud or security issues</li>
                <li>
                  To generate AI-powered product descriptions using Google
                  Gemini
                </li>
              </ul>
            </section>

            <section>
              <h3>4. Third-Party Services</h3>
              <p>
                We use the following third-party services that may collect
                information:
              </p>

              <h4>4.1 Clerk (Authentication)</h4>
              <p>
                We use Clerk for user authentication and identity management.
                Clerk collects and processes authentication data according to
                their privacy policy.
              </p>

              <h4>4.2 Cloudinary (Image Storage)</h4>
              <p>
                Product images are stored using Cloudinary's cloud storage
                service. Images you upload are processed and stored according to
                Cloudinary's privacy policy.
              </p>

              <h4>4.3 Google Gemini AI</h4>
              <p>
                We use Google Gemini to generate AI-powered product
                descriptions. Product names you submit for description
                generation are sent to Google's AI service.
              </p>

              <h4>4.4 MongoDB Atlas</h4>
              <p>
                Your data is stored in MongoDB Atlas databases hosted by
                MongoDB, Inc.
              </p>

              <h4>4.5 Analytics</h4>
              <p>
                We collect anonymous usage analytics to understand how users
                interact with our Service and improve user experience.
              </p>
            </section>

            <section>
              <h3>5. Data Storage and Security</h3>
              <p>
                We implement appropriate technical and organizational security
                measures to protect your personal information:
              </p>
              <ul>
                <li>Data is transmitted using HTTPS encryption</li>
                <li>
                  Passwords are handled securely through Clerk's authentication
                  system
                </li>
                <li>Database access is restricted and monitored</li>
                <li>Regular security updates and patches are applied</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to protect
                your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h3>6. Data Retention</h3>
              <p>
                We retain your personal information for as long as your account
                is active or as needed to provide you with services. If you wish
                to delete your account, please contact us at
                nihesh.dev@gmail.com. We may retain certain information as
                required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h3>7. Your Data Rights</h3>
              <p>
                Depending on your location, you may have the following rights:
              </p>
              <ul>
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  data
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your data in a
                  portable format
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your
                  personal information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing
                </li>
              </ul>
              <p>
                To exercise these rights, please contact us at
                nihesh.dev@gmail.com.
              </p>
            </section>

            <section>
              <h3>8. Cookies and Tracking</h3>
              <p>
                We use cookies and similar tracking technologies to enhance your
                experience:
              </p>
              <ul>
                <li>Session cookies for authentication</li>
                <li>Preference cookies to remember your theme selection</li>
                <li>Analytics cookies to understand usage patterns</li>
              </ul>
              <p>
                You can control cookies through your browser settings, but
                disabling cookies may affect your ability to use certain
                features of the Service.
              </p>
            </section>

            <section>
              <h3>9. Email Communications</h3>
              <p>We use email to:</p>
              <ul>
                <li>Send verification codes during registration</li>
                <li>Provide important service notifications</li>
                <li>Respond to your inquiries</li>
              </ul>
              <p>
                Email communications are sent using Gmail's SMTP service with
                OAuth2 authentication for security.
              </p>
            </section>

            <section>
              <h3>10. Children's Privacy</h3>
              <p>
                The Service is not intended for users under the age of 18. We do
                not knowingly collect personal information from children under
                18. If you become aware that a child has provided us with
                personal information, please contact us, and we will take steps
                to delete such information.
              </p>
            </section>

            <section>
              <h3>11. International Data Transfers</h3>
              <p>
                Your information may be transferred to and processed in
                countries other than your country of residence. These countries
                may have data protection laws that are different from the laws
                of your country. By using the Service, you consent to such
                transfers.
              </p>
            </section>

            <section>
              <h3>12. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. We encourage you
                to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h3>13. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <p>Email: nihesh.dev@gmail.com</p>
            </section>

            <section>
              <h3>14. Data Controller</h3>
              <p>
                The data controller responsible for your personal information is
                Nihesh's Seller Portal. For any data protection concerns, please
                reach out to us at the contact information provided above.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Terms;
