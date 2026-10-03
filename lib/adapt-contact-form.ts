type Replacement = [string, string];

const PHONE_DISPLAY = "+33 6 09 88 46 60";
const PHONE_TEL = "+33609884660";
const EMAIL = "target@contact.fr";

/** Contact form copy aligned with Target Agency services on the site. */
const CONTACT_REPLACEMENTS: Replacement[] = [
  ['href="tel:+1 (555) 123-4567"', `href="tel:${PHONE_TEL}"`],
  ["tel:+1 (555) 123-4567", `tel:${PHONE_TEL}`],
  ["+1 (555) 123-4567", PHONE_DISPLAY],
  ["+1 (555)***-****", PHONE_DISPLAY],

  ["hello@quantumflux.top", EMAIL],
  ['href="mailto:hello@quantumflux.top"', `href="mailto:${EMAIL}"`],
  ["contact@target-agency.fr", EMAIL],
  ['href="mailto:contact@target-agency.fr"', `href="mailto:${EMAIL}"`],

  ["Dronningens Gate 15, Oslo", "France — 100% à distance"],
  ["Dronningens Gate 15", "France"],
  ["Working globally —", "Basé en France —"],
  ["Working globally ·", "Basé en France —"],
  ["Working globally", "Basé en France"],
  ["Remote first", "100% à distance"],

  [
    "Apportez votre système, votre workflow ou votre idée.",
    "Parlez-nous de votre projet : branding, site web, réseaux sociaux ou publicité.",
  ],
  [
    "Apportez votre projet, votre marque ou votre ambition.",
    "Parlez-nous de votre projet : branding, site web, réseaux sociaux ou publicité.",
  ],
  [
    "Nous vous aiderons à comprendre ce qu'il faut pour le concevoir et le déployer.",
    "Décrivez votre besoin — nous vous répondons sous 24 h avec une première orientation.",
  ],
  [
    "Nous vous aiderons à comprendre ce qu\u2019il faut pour le concevoir et le déployer.",
    "Décrivez votre besoin — nous vous répondons sous 24 h avec une première orientation.",
  ],
  [
    "Nous vous aiderons à définir la meilleure stratégie pour la concrétiser.",
    "Décrivez votre besoin — nous vous répondons sous 24 h avec une première orientation.",
  ],

  ["Your name *", "Votre nom *"],
  ["Your name", "Votre nom"],
  ['placeholder="Jane Smith"', 'placeholder="Prénom Nom"'],
  ["Jane Smith", "Prénom Nom"],
  ["Company", "Entreprise"],
  ['placeholder="Quantum Corp."', 'placeholder="Votre entreprise"'],
  ["Quantum Corp.", "Votre entreprise"],
  ['placeholder="jane@framer.com"', `placeholder="${EMAIL}"`],
  ["jane@framer.com", EMAIL],
  ["Your email address", "Votre adresse email"],
  ["Phone", "Téléphone"],

  ["What do you want to automate?**", "Parlez-nous de votre projet **"],
  ["What do you want to automate?", "Parlez-nous de votre projet"],
  [
    'placeholder="Enter your text"',
    'placeholder="Ex. refonte de marque, lancement de site, campagne Meta Ads, gestion des réseaux…"',
  ],
  [
    "Enter your text",
    "Ex. refonte de marque, lancement de site, campagne Meta Ads, gestion des réseaux…",
  ],

  ["START THE CONVERSATION", "ENVOYER MA DEMANDE"],
  ["CONTACT SUPPORT", "NOUS CONTACTER"],
  ["Send message", "Envoyer le message"],
  ["Book a Call", "Prendre rendez-vous"],
  ["Get a job", "Rejoindre l'équipe"],

  ["What service are you looking for?", "Quel service recherchez-vous ?"],
  ["Computer vision", "Branding & identité visuelle"],
  ["AI strategy", "Stratégie digitale & réseaux sociaux"],
  ["Stratégie marketing", "Stratégie digitale & réseaux sociaux"],
  ["Data engineering", "Création de site web"],
  ["Custom solution", "Acquisition & publicité"],
  ["Publicité & social media", "Acquisition & publicité"],

  ["Current monthle AI spend", "Budget estimé du projet"],
  ["Current monthly AI spend", "Budget estimé du projet"],
  ["Budget marketing mensuel", "Budget estimé du projet"],
  ["Under $5k", "Moins de 2 000 €"],
  ["$5k-$10k", "2 000 € – 5 000 €"],
  ["$10k-$50k", "5 000 € – 10 000 €"],
  ["$50k-$100k", "10 000 € – 25 000 €"],
  ["$100k-$500k", "Plus de 25 000 €"],
];

export function adaptContactForm(text: string): string {
  let out = text;
  for (const [from, to] of CONTACT_REPLACEMENTS) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}
