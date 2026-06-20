import LegalPage, { type LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'welcome',
    heading: 'The short version',
    body: [
      'TechMart is a place where people in the community buy and sell tech directly with one another. We provide the marketplace; you bring the gear and the good faith.',
      'By creating an account or using TechMart, you agree to these terms. We have kept them plain and fair, because a marketplace only works when everyone knows where they stand.',
    ],
  },
  {
    id: 'account',
    heading: 'Your account',
    body: [
      'You are responsible for what happens under your account, so keep your password to yourself and your contact details up to date. Please use accurate information — buyers and sellers trust each other partly because of it.',
      'You must be old enough to form a binding agreement in your country to sell here. If we notice an account being used to deceive or harm others, we may suspend it.',
    ],
  },
  {
    id: 'listings',
    heading: 'Listing your items',
    body: [
      'List only items you actually own and are legally allowed to sell. Describe them honestly — real photos, the true condition, and a fair price. Misleading listings erode the trust the whole community depends on.',
      'Every listing stays live for 30 days. We will remind you before it expires so you can renew it in one tap, or let it quietly disappear. You can edit, renew, or remove your listings at any time.',
      'No counterfeits, stolen goods, recalled or unsafe products, or anything illegal to sell where you are. We may remove listings that break these rules.',
    ],
  },
  {
    id: 'transactions',
    heading: 'Buying and selling',
    body: [
      'TechMart connects buyers and sellers — we are not a party to your transaction and we do not hold funds or ship items. The agreement is between you and the other person.',
      'That means the details are up to you: inspect items before paying, agree on price and meeting place, and only complete a deal you are comfortable with. Our Safety Tips are there to help you do this well.',
    ],
  },
  {
    id: 'conduct',
    heading: 'Playing fair',
    body: [
      'Treat other members with respect. Do not harass anyone, spam listings or messages, scrape the site, attempt to break or overload it, or try to move people off-platform to scam them.',
      'Accounts used for fraud, abuse, or repeated rule-breaking can be limited or removed. We would much rather celebrate good sellers than police bad ones, so help us keep it clean.',
    ],
  },
  {
    id: 'content',
    heading: 'Your content',
    body: [
      'You keep ownership of the photos and descriptions you post. By posting them, you give us permission to display and promote your listings on TechMart so buyers can find them.',
      'Please only upload content you have the right to use, and nothing offensive or unlawful.',
    ],
  },
  {
    id: 'disclaimer',
    heading: 'No guarantees',
    body: [
      'TechMart is provided "as is". We work hard to keep things running smoothly, but we cannot promise the service will always be uninterrupted or error-free, and we do not verify every item or member.',
      'We are not responsible for the quality, safety, legality, or accuracy of listings, or for the conduct of buyers and sellers. Use your judgement, especially with high-value deals.',
    ],
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: [
      'To the fullest extent the law allows, TechMart is not liable for losses arising from your use of the marketplace or from any transaction between members. Your dealings with other users are at your own risk.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    body: [
      'As TechMart grows, these terms may change. When they do, we will update the date at the top of this page, and significant changes will be highlighted. Continuing to use TechMart after an update means you accept the new terms.',
    ],
  },
  {
    id: 'contact',
    heading: 'Talk to us',
    body: [
      'Questions about these terms, or something not sitting right? Our team is a message away through the Help Center — we read everything and we reply fastest on WhatsApp.',
    ],
  },
];

const Terms = () => (
  <LegalPage
    eyebrow="Terms of service"
    title="The deal, in plain words"
    updated="June 2026"
    intro="These terms explain what you can expect from TechMart and what we ask of you in return. No dense legal maze — just a clear, fair agreement for a community marketplace."
    sections={sections}
  />
);

export default Terms;
