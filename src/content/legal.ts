export const COPYRIGHT_OWNER = "Sanju Thomas";
export const COPYRIGHT_YEAR = "2026";
export const SITE_NAME = "Scrum Retrospective";
export const SITE_URL = "https://scrumretrospective.org";
export const GITHUB_REPO_URL =
  "https://github.com/sanjuthomas/scrumretrospective.github.io";
export const PERSONAL_BLOG_URL = "https://sanjuthomas.com";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  list?: string[];
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Agreement",
    paragraphs: [
      `These Terms of Use ("Terms") govern your access to and use of ${SITE_NAME} at ${SITE_URL} and related services (collectively, the "Service"), operated by ${COPYRIGHT_OWNER} ("we", "us", or "operator").`,
      "By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
    ],
  },
  {
    title: "Description of the Service",
    paragraphs: [
      "The Service is a free, browser-based tool for facilitating team retrospectives. It does not require user accounts. Session data is held in server memory for the duration of an active retrospective and is removed when the facilitator ends the session or when the sync server restarts or redeploys.",
      "The Service is provided for general team facilitation only. It is not designed for regulated, confidential, or high-risk use cases.",
    ],
  },
  {
    title: "No Sensitive or Confidential Information",
    paragraphs: [
      "You must not enter sensitive, confidential, or regulated information into the Service. This includes, without limitation:",
    ],
    list: [
      "Personally identifiable information beyond first names or display names needed to participate",
      "Passwords, API keys, tokens, or other credentials",
      "Protected health information (PHI), financial account numbers, government ID numbers, or payment card data",
      "Trade secrets, attorney-client privileged material, or information you are under a legal or contractual duty to keep confidential",
      "Any data whose loss, disclosure, or unauthorized access could harm an individual or organization",
    ],
  },
  {
    title: "Your Responsibility",
    paragraphs: [
      "You are solely responsible for what you and your participants submit to the Service, for sharing session links only with intended participants, and for complying with your organization's policies and applicable law.",
      "You represent that you have authority to use the Service for your team and that content you submit does not violate law or third-party rights.",
    ],
  },
  {
    title: "Disclaimer of Warranties",
    paragraphs: [
      'THE SERVICE AND ALL SOFTWARE MADE AVAILABLE IN CONNECTION WITH IT ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY.',
      "To the fullest extent permitted by law, we disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, availability, security, and uninterrupted or error-free operation.",
      "We do not warrant that session data will be preserved, that the Service will meet your requirements, or that defects will be corrected.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, in no event shall the operator, contributors, or copyright holders be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, data, goodwill, business interruption, or other intangible losses, arising out of or related to your use of or inability to use the Service, even if advised of the possibility of such damages.",
      "To the fullest extent permitted by applicable law, our total aggregate liability for any claims arising out of or relating to the Service or these Terms shall not exceed zero U.S. dollars (US $0).",
      "Some jurisdictions do not allow certain limitations of liability; in those jurisdictions, our liability is limited to the maximum extent permitted by law.",
    ],
  },
  {
    title: "Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless the operator and contributors from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from your use of the Service, your content, your violation of these Terms, or your violation of any law or third-party right.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "The Service may rely on third-party hosting and infrastructure (for example, static hosting and a sync API). We are not responsible for third-party services, outages, or policies. Your use of those services may be subject to their own terms.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may modify the Service or these Terms at any time. Material changes will be reflected on this page with an updated effective date. Continued use after changes constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or discontinue the Service at any time without notice. Upon termination of a session or the Service, in-memory data may be deleted without recovery.",
    ],
  },
  {
    title: "Open Source Software",
    paragraphs: [
      `Source code for the Service is made available under the MIT License. See the License page or the LICENSE file in the project repository. The MIT License governs the software; these Terms govern use of the hosted Service.`,
    ],
  },
  {
    title: "General",
    paragraphs: [
      "These Terms constitute the entire agreement between you and the operator regarding the Service. If any provision is held unenforceable, the remaining provisions remain in effect. Our failure to enforce a provision is not a waiver.",
      "Questions about these Terms may be directed to the repository owner via the project's GitHub page.",
    ],
  },
];

export const TERMS_EFFECTIVE_DATE = "June 4, 2026";

export const MIT_LICENSE_BODY = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
