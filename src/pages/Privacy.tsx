import LegalPage, { type LegalSection } from '../components/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'promise',
    heading: 'Our promise',
    body: [
      'Your data is yours. We only collect what we genuinely need to run the marketplace, we are honest about how we use it, and we never sell it. This page explains exactly what that means.',
    ],
  },
  {
    id: 'collect',
    heading: 'What we collect',
    body: [
      'Account details: your name, email, and phone number when you sign up, plus anything you choose to add to your profile like a photo, bio, or location.',
      'Listings and messages: the items you post, their photos and descriptions, and the messages you exchange with other members.',
      'Usage basics: light technical information such as which listings are viewed, so the marketplace stays fast and relevant. We keep a small preference (like your chosen currency) on your device.',
    ],
  },
  {
    id: 'use',
    heading: 'How we use it',
    body: [
      'To show your listings to buyers, let people contact you, power favorites and messages, and keep your account secure.',
      'To send you helpful notices — for example, a reminder by email or SMS before one of your listings is about to expire, so you can renew it instead of losing it.',
      'To understand what is working and make TechMart better. We aim for the lightest touch possible.',
    ],
  },
  {
    id: 'sharing',
    heading: 'What others see',
    body: [
      'When you publish a listing, the contact options you choose to add — such as your phone, WhatsApp, or email — are shown to buyers so they can reach you. You decide what to share.',
      'We use a small number of trusted service providers (for example, to host the app and to send email or SMS notifications). They only handle data on our behalf and under strict instructions.',
      'We will only disclose information if the law genuinely requires it, or to protect members from fraud or harm. We do not sell your personal information. Ever.',
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep things',
    body: [
      'Listings run for 30 days and then drop off the marketplace unless you renew them. We keep your account information for as long as your account is active.',
      'You can remove your listings at any time, and you can ask us to close your account and delete your personal data.',
    ],
  },
  {
    id: 'choices',
    heading: 'Your choices',
    body: [
      'You can view and update your profile whenever you like, control which contact details appear on your listings, and opt out of non-essential notifications.',
      'Want a copy of your data, or want it deleted? Just ask through the Help Center and we will take care of it.',
    ],
  },
  {
    id: 'security',
    heading: 'Keeping it safe',
    body: [
      'We use modern security practices, encrypted connections, and access controls to protect your information. No system is perfect, so please use a strong password and keep your login to yourself.',
    ],
  },
  {
    id: 'children',
    heading: 'Younger users',
    body: [
      'TechMart is intended for adults able to enter into a sale. It is not designed for children, and we do not knowingly collect their information.',
    ],
  },
  {
    id: 'changes',
    heading: 'Updates to this policy',
    body: [
      'If our practices change, we will update this page and refresh the date at the top. We will flag anything important rather than burying it.',
    ],
  },
  {
    id: 'contact',
    heading: 'Get in touch',
    body: [
      'Privacy questions, requests, or concerns are always welcome. Reach our team through the Help Center — we are quickest to respond on WhatsApp.',
    ],
  },
];

const Privacy = () => (
  <LegalPage
    eyebrow="Privacy policy"
    title="Your data, handled with care"
    updated="June 2026"
    intro="We built TechMart to be a marketplace you can trust — and that starts with respecting your privacy. Here is a clear, honest look at the information we collect and how we treat it."
    sections={sections}
  />
);

export default Privacy;
