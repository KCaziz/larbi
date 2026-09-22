// Real contact details and social links for the footer. Nothing here is invented:
// every value starts empty and the footer only renders the ones that are filled in.
// Fill this in with what the client gives you — do not guess a phone number, an
// address or a social handle.
//
// - phone / address: literal text shown in the footer (leave '' to hide the line).
// - email: shown as a mailto: link (leave '' to hide it).
// - socialLinks: one entry per network the client actually uses. `platform` is
//   free text shown next to the icon (e.g. "Facebook", "Instagram", "WhatsApp");
//   lucide-react ships no brand logos, so entries use a neutral icon matched by
//   type (see socialIcon() in Footer.jsx) — the platform name is what identifies
//   the network. Leave the array empty, or drop an entry, to hide it.
export const contactInfo = {
  phone: '',
  email: '',
  address: '',
};

export const socialLinks = [
  // { platform: 'Facebook', url: 'https://facebook.com/...' },
  // { platform: 'Instagram', url: 'https://instagram.com/...' },
  // { platform: 'LinkedIn', url: 'https://linkedin.com/company/...' },
  // { platform: 'WhatsApp', url: 'https://wa.me/213...' },
];
