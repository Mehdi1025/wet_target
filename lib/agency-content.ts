import { adaptContactForm } from "@/lib/adapt-contact-form";

type Replacement = string | [string, string] | [string, string, string, string];

function applyReplacements(text: string, replacements: Replacement[]): string {
  let out = text;
  for (const entry of replacements) {
    if (typeof entry === "string") continue;
    if (entry.length === 2) {
      const [from, to] = entry;
      if (out.includes(from)) out = out.split(from).join(to);
    } else if (entry.length === 4) {
      const [a, b, , d] = entry;
      out = out.split(`${a}","${b}`).join(`${a}","${d}`);
      out = out.split(`${a}"," ${b}`).join(`${a}"," ${d}`);
    }
  }
  return out;
}

const SHARED_REPLACEMENTS: Replacement[] = [
  [" - My Framer Site", " | Target Agency"],
  ["hello@quantumflux.top", "target@contact.fr"],
  ["quantumsupport@gmail.com", "target@contact.fr"],
  ["+1 (555) 123-4567", "+33 6 09 88 46 60"],
  ["+1 (555)***-****", "+33 6 09 88 46 60"],
  ["Book afree call", "Prendre rendez-vous"],
  ["Book a Call", "Prendre rendez-vous"],
  ["Book a free call", "Prendre rendez-vous"],
  ["Start a conversation", "Démarrer un projet"],
  ["with our support team", "avec notre équipe"],
  ["More articles", "Plus d'articles"],
  ["Previous case", "Cas précédent"],
  ["Next case", "Cas suivant"],
  ["More cases", "Plus de réalisations"],
  ["Inside Quantum Flux", "Aperçu du projet"],
  ["HelioDesk Platforms", "Luxkey"],
  ["HelioDesk", "Luxkey"],
  ["David Ramirez", "Adam Fisli"],
  ["Director of AI Platforms", "Fondateur"],
  ["Director of Logistics", "Directrice marketing"],
  ["Daniella Mercer", "Claire Dubois"],
  ["OUR PRINCIPLES", "NOS PRINCIPES"],
  ["No hype. Just systems", "Pas de jargon. Juste des résultats."],
  ["Clarity beats automation", "La clarté prime sur la complexité"],
  ["Decisions over demos", "Les résultats avant les promesses"],
  ["Designed for messy reality", "Conçu pour la réalité du terrain"],
  ["Systems that hold under pressure", "Des stratégies qui tiennent dans la durée"],
  [
    "No preparation needed — we'll guide the conversation and focus on what matters.",
    "Aucune préparation nécessaire — nous vous guidons et nous concentrons sur l'essentiel.",
  ],
  [
    "No preparation needed — we'll guide the conversation and focus on what matters most.",
    "Aucune préparation nécessaire — nous vous guidons et nous concentrons sur l'essentiel.",
  ],
  [
    "We believe technology should solve real problems, not create new ones.",
    "Une collaboration fluide, des livrables clairs et un accompagnement qui va droit au but.",
  ],
  [
    "We design AI systems that improve real work — not just demonstrate technology.",
    "Nous concevons des stratégies marketing qui produisent des résultats concrets — pas seulement de la visibilité.",
  ],
  [
    "We'll review your workflows, identify where AI can create impact, and outline a clear path forward.",
    "Nous analysons votre marque, identifions les leviers de croissance et définissons une feuille de route claire.",
  ],
  [
    "We'll review your workflows, identify AI opportunities, and outline a clear path forward.",
    "Nous analysons votre marque, identifions les opportunités de croissance et définissons une feuille de route claire.",
  ],
  [
    "We'll review your  workflows, identify where AI can create impact, and outline a clear path forward.",
    "Nous analysons votre marque, identifions les leviers de croissance et définissons une feuille de route claire.",
  ],
  [
    "Notes on AI systems, architecture decisions,and lessons from real deployments.",
    "Conseils branding, stratégie digitale et retours d'expérience sur nos projets clients.",
  ],
  ["AI technology", "Stratégie digitale"],
  ["Automation Features", "Branding"],
  ["Automation Tools", "Social Media"],
  ["Data Analysis", "Publicité"],
  ["Data Insights", "Contenus"],
  ["System Integrations", "Web Design"],
  ["AI strategy", "Stratégie marketing"],
  ["Current monthle AI spend", "Budget marketing mensuel"],
  ["AI Workflow Analysis, AI Workflow Automation", "Audit digital, Campagnes publicitaires"],
  [
    "They approached the problem as a system, not a tool. The result was reliable workflows that improved daily operations.",
    "Ils ont abordé le projet avec une vision globale, pas des actions isolées. Résultat : une marque cohérente et des campagnes qui performent.",
  ],
  [
    "How AI systems reshape operational workflows in modern companies",
    "Comment construire une identité de marque forte et cohérente",
  ],
  [
    "Why most AI projects fail before reaching production environments",
    "Pourquoi la plupart des stratégies digitales échouent avant d'atteindre leurs objectifs",
  ],
  [
    "Building AI systems that work inside real business operations",
    "Construire une stratégie de contenu qui convertit réellement",
  ],
  [
    "From automation tools to full-scale operational AI systems",
    "De la visibilité à la conversion : transformer votre présence en résultats",
  ],
  [
    "What it takes to deploy AI beyond prototypes and demos",
    "Passer du posting aléatoire à une stratégie social media structurée",
  ],
  [
    "How AI decision systems improve speed and operational consistency",
    "Au-delà du visuel : créer une expérience de marque mémorable",
  ],
  [
    "Designing AI workflows that integrate with existing business systems",
    "Du chaos créatif à une direction artistique structurée",
  ],
  [
    "The gap between AI experiments and production-ready systems explained",
    "De la dispersion à une identité visuelle unifiée",
  ],
  [
    "Why operational AI matters more than model performance alone",
    "Pourquoi la stratégie prime sur les tendances éphémères",
  ],
  [
    "How companies scale AI systems across complex operational environments",
    "Comment scaler sa présence digitale sans perdre en cohérence",
  ],
  [
    "Building reliable AI systems for messy real-world workflows",
    "Des campagnes qui performent sur le terrain, pas seulement en présentation",
  ],
  [
    "Real-world workflows are rarely clean or predictable. Systems must handle inconsistencies, missing data, and unexpected scenarios. Building reliable AI means designing for this complexity from the start, rather than assuming ideal conditions.",
    "Le terrain marketing est rarement parfait : concurrence, contraintes budgétaires, messages à faire évoluer. Une bonne stratégie anticipe ces réalités dès le départ, plutôt que de viser un scénario idéal.",
  ],
  [
    "A practical look at how to design AI systems that can handle unpredictable inputs, edge cases, and constantly changing conditions in real operational environments.",
    "Un regard concret sur la façon de bâtir une stratégie marketing capable de s'adapter aux imprévus, aux saisons et aux évolutions de votre marché.",
  ],
  [
    "In most organizations, workflows are not systems — they are habits. People move information between tools, coordinate tasks manually, and make decisions based on partial visibility. What starts as manageable complexity eventually turns into operational drag.",
    "Dans beaucoup d'entreprises, le marketing repose sur des habitudes : publications irrégulières, messages incohérents, actions non mesurées. Ce qui semble gérable finit par freiner la croissance.",
  ],
  [
    "A major limitation of traditional workflows is distributed decision-making. Different people make decisions with different context, which introduces variability.",
    "Un frein classique : chacun communique différemment, sans ligne directrice commune. La marque perd en clarté et en impact.",
  ],
  [
    "AI systems centralize decision logic inside workflows. Decisions become:",
    "Une stratégie marketing unifiée centralise vos messages et vos priorités. Les décisions deviennent :",
  ],
  [
    "AI systems connect these steps into continuous flows. Information moves without interruption, actions trigger automatically, and outcomes feed back into the system. Over time, workflows stop behaving like chains and start behaving like loops.",
    "Une stratégie bien pensée enchaîne branding, contenus, publicité et conversion. Chaque action nourrit la suivante, et votre présence devient un système cohérent — pas une suite d'efforts isolés.",
  ],
  [
    "Well-designed AI systems don't rely on perfect conditions. They introduce flexibility into workflows, allowing systems to adapt instead of breaking. This makes them significantly more resilient than rigid automation.",
    "Une stratégie solide ne dépend pas de conditions parfaites. Elle laisse de la marge pour ajuster le message, le canal ou le rythme, sans remettre tout en question.",
  ],
  [
    "With AI systems, scaling shifts toward system capacity.",
    "Avec une base marketing structurée, la croissance repose sur la capacité à décliner sans perdre en qualité.",
  ],
  [
    "Repetitive work is handled automatically, decision processes are standardized, and workflows remain stable even as volume increases. Growth no longer depends entirely on headcount.",
    "Les tâches répétitives sont rationalisées, les messages sont alignés, et la production reste cohérente même quand le volume augmente.",
  ],
  [
    "One of the most overlooked advantages of AI systems is visibility. When workflows are system-driven, every action and decision becomes observable.",
    "Un avantage souvent sous-estimé : la visibilité. Quand la stratégie est structurée, chaque action devient mesurable et comparable.",
  ],
  [
    "AI doesn't just automate tasks — it restructures how work is done.",
    "Le marketing efficace ne se contente pas de publier — il restructure la façon dont votre marque communique et convertit.",
  ],
  [
    "Companies that treat AI as a system, not a feature, gain a real advantage: more reliable operations, faster decisions, and the ability to scale without chaos.",
    "Les marques qui pensent marketing global — et non actions ponctuelles — gagnent en cohérence, en réactivité et en capacité à grandir sans se disperser.",
  ],
  [
    "There is a significant gap between AI experiments and production systems. Experiments operate in controlled environments, while production requires stability and integration. Bridging this gap means addressing operational constraints, not just improving model performance.",
    "Il existe un écart fréquent entre une belle présentation et une stratégie qui performe. L'une fonctionne en démo, l'autre doit tenir dans la durée, avec des objectifs, un budget et des résultats mesurables.",
  ],
  [
    "A clear explanation of why AI experiments rarely translate into production systems and what changes when moving from isolated testing to real-world deployment.",
    "Pourquoi tant de stratégies digitales restent au stade de l'intention, et ce qui change quand on passe à une exécution réelle et suivie.",
  ],
  [
    "Better models don't automatically lead to better outcomes. In most cases, the real challenge lies in how AI is used within workflows. Operational AI focuses on system design, integration, and execution — the factors that ultimately determine whether AI creates value.",
    "Un beau visuel ne suffit pas à convertir. Le vrai enjeu, c'est la cohérence entre message, cible, canal et parcours client — autant d'éléments qui déterminent si votre marketing produit de la valeur.",
  ],
  [
    "A perspective on why the success of AI systems depends more on operational integration and system design than on incremental improvements in model performance.",
    "Pourquoi la réussite d'une stratégie marketing dépend davantage de la cohérence globale que d'une action isolée, aussi créative soit-elle.",
  ],
  [
    "Scaling AI is not just about handling more data — it's about maintaining system stability as complexity grows. Companies that succeed treat AI as infrastructure, ensuring systems remain reliable even as they expand across multiple workflows and environments.",
    "Scaler sa présence digitale, ce n'est pas publier plus : c'est garder une identité forte, des messages clairs et des processus fiables quand l'activité s'intensifie.",
  ],
  [
    "An overview of how organizations scale AI systems across teams, tools, and processes while maintaining reliability and avoiding increasing operational complexity.",
    "Comment structurer branding, contenus, publicité et suivi pour grandir sans perdre en clarté ni en efficacité.",
  ],
  [
    "AI demos can be impressive, but they rarely reflect production reality. Real deployment requires handling messy data, edge cases, and system constraints. Moving beyond prototypes means designing systems that can operate consistently, not just perform well under controlled conditions.",
    "Une campagne peut briller en présentation, mais le terrain est exigeant : concurrence, saisonnalité, retours clients. Passer du concept à l'action, c'est construire une stratégie tenable, pas seulement esthétique.",
  ],
  [
    "A practical perspective on the gap between AI demos and production systems, and what is required to build solutions that operate reliably in real-world environments.",
    "Le fossé entre une idée séduisante et une stratégie qui performe — et ce qu'il faut pour passer durablement à l'action.",
  ],
  [
    "Most companies don't operate on clean, unified systems. Instead, they rely on a mix of tools, processes, and data sources. Designing AI workflows requires working within this reality, ensuring systems integrate smoothly rather than adding another disconnected layer.",
    "Peu d'entreprises partent de zéro. La plupart cumulent site, réseaux, publicité et outils internes. Une bonne stratégie s'appuie sur cet existant au lieu d'ajouter une couche de plus.",
  ],
  [
    "How to design AI workflows that work with existing tools, data sources, and operational processes without creating fragmentation or additional complexity.",
    "Comment articuler branding, contenus et acquisition avec vos outils actuels, sans complexifier inutilement votre organisation.",
  ],
  [
    "Operational decisions are often slow and inconsistent because they depend on individuals. AI decision systems introduce structure by embedding logic into workflows. This allows companies to make faster decisions while maintaining consistency, even as complexity increases.",
    "Sans cadre, les choix marketing varient d'une personne à l'autre. Une direction claire accélère les décisions et garantit une communication cohérente, même quand l'activité s'accélère.",
  ],
  [
    "An overview of how AI-driven decision systems reduce variability, improve execution speed, and create more consistent outcomes across operational workflows.",
    "Comment une stratégie structurée réduit les hésitations, accélère l'exécution et aligne vos actions sur des objectifs mesurables.",
  ],
  [
    "Automation often starts with isolated tools solving narrow problems. Over time, these tools create fragmentation instead of efficiency. The shift toward AI systems brings these pieces together, forming connected workflows that operate as unified systems rather than disconnected solutions.",
    "Le marketing commence souvent par des actions isolées : un post, une pub, une refonte. Avec le temps, cela se disperse. L'enjeu est de relier identité, contenus et acquisition dans une même logique.",
  ],
  [
    "How companies evolve from using simple automation tools to building fully integrated AI systems that manage workflows, support decisions, and operate across multiple business processes.",
    "Comment passer d'actions ponctuelles à une stratégie digitale intégrée, de la marque à la conversion.",
  ],
  [
    "Building AI systems is not just about models — it's about how they interact with operations. Real value appears only when systems fit into workflows, handle real inputs, and support decisions at scale. This requires thinking beyond tools and focusing on how work is actually executed.",
    "Une stratégie marketing ne se résume pas à un visuel ou un outil : elle doit s'inscrire dans votre quotidien, vos objectifs et vos moyens. La valeur apparaît quand chaque action sert un résultat concret.",
  ],
  [
    "A breakdown of what it takes to design AI systems that integrate with existing workflows, support real decisions, and operate reliably inside complex business environments.",
    "Ce qu'il faut pour bâtir une présence digitale cohérente, mesurable et adaptée à la réalité de votre entreprise.",
  ],
  [
    "Many AI projects show early promise but never reach production. The issue is rarely the model itself — it's the lack of integration, ownership, and system design. Without aligning AI with real workflows, projects remain isolated experiments instead of becoming part of how the business actually operates.",
    "Beaucoup de projets marketing démarrent avec enthousiasme, puis s'essoufflent. Rarement faute de créativité — plutôt faute de stratégie, de suivi et de cohérence. Sans cap clair, les efforts restent des expériences isolées au lieu de devenir un levier de croissance.",
  ],
  [
    "An exploration of why many AI initiatives fail to move beyond experimentation, and what prevents teams from turning promising prototypes into reliable systems used in real operational environments.",
    "Pourquoi tant d'initiatives digitales n'aboutissent pas — et ce qui manque pour transformer une bonne idée en résultats durables.",
  ],
  [
    "From fragmented work to structured systems",
    "D'un marketing dispersé à une stratégie structurée",
  ],
  ["Rethinking how decisions are made", "Repenser vos priorités marketing"],
  ["From steps to continuous flows", "D'actions isolées à un parcours cohérent"],
  ["Adapting to real-world complexity", "S'adapter à la réalité du marché"],
  ["Scaling without proportional complexity", "Grandir sans se disperser"],
  ["Making operations visible", "Rendre la performance lisible"],
  ["This creates clarity:", "Ce que cela apporte :"],
  ["Conclusion", "En résumé"],
  [
    "Details about the legal entity behind Quantum, including registration, jurisdiction, and company information.",
    "Informations sur l'entité Target Agency, son activité et ses coordonnées.",
  ],
  [
    "What you can expect from our corporate transparency, and what we expect from your legal compliance. If anything here is unclear, email quantumsupport@gmail.com",
    "Ce que vous pouvez attendre de notre transparence, et ce que nous attendons en matière de respect de nos conditions. Pour toute question : target@contact.fr",
  ],
  [
    "Quantum Flux Corp. is incorporated under the laws of the jurisdiction of its registration. Our business activities are conducted in accordance with international standards for digital service providers and AI technology developers.",
    "Target Agency exerce son activité d'agence de marketing digital et de communication conformément à la réglementation en vigueur.",
  ],
  [
    "Official communication should be directed to our primary electronic contact point. Email: quantumsupport@gmail.com For urgent legal matters, please specify \\",
    "Pour toute communication officielle : target@contact.fr. Pour les demandes urgentes, merci de préciser l'objet de votre message.",
  ],
  [
    "Quantum Flux Corp. is represented by its Board of Directors and authorized officers. Any agreements or contracts binding the company must be executed by an authorized signatory in accordance with our corporate bylaws.",
    "Target Agency est représentée par ses dirigeants habilités. Tout engagement contractuel doit être validé par un signataire autorisé.",
  ],
  [
    "As a provider of AI-driven services, we strive to comply with evolving regulations governing artificial intelligence, data protection, and electronic commerce. This includes adherence to regional standards such as GDPR where applicable.",
    "En tant qu'agence digitale, nous respectons les réglementations applicables en matière de protection des données, de commerce en ligne et de communication.",
  ],
  [
    ", our logos, and proprietary AI model architectures are protected by trademark and copyright laws. Unauthorized use of our corporate identity or intellectual property is strictly prohibited.",
    ", nos logos et nos créations sont protégés par le droit d'auteur et les marques. Toute utilisation non autorisée de notre identité est interdite.",
  ],
  [
    "Quantum Flux Corp. maintains professional liability insurance appropriate for a technology and AI service provider. Our liability to users and third parties is strictly limited as defined in our Terms of Service.",
    "Target Agency souscrit les assurances professionnelles adaptées à son activité. Sa responsabilité est limitée conformément à ses conditions générales.",
  ],
  [
    "Our digital infrastructure and AI processing services are hosted by professional third-party cloud providers. While we manage the platform, the physical servers are maintained in secure data centers worldwide.",
    "Nos services digitaux sont hébergés par des prestataires professionnels, dans des environnements sécurisés.",
  ],
  [
    "We make every effort to ensure that the information on our website is accurate and up to date. However, Quantum Flux Corp. is not liable for errors or omissions in the legal information provided on this platform.",
    "Nous veillons à maintenir des informations exactes et à jour. Target Agency ne saurait être tenue responsable d'erreurs ou d'omissions sur les pages légales du site.",
  ],
  ["Quantum Flux Corp.", "Target Agency"],
  ["Quantum Flux", "Target Agency"],
  ["Quantum Corp.", "Votre entreprise"],
  ["Quantum", "Target"],
  ["Orbitra Systems", "Luxkey"],
  ["LumenArc Energy", "Latifa B."],
  [
    "Expert insights on web design, branding, and digital strategy to help your business stand out.",
    "Conseils branding, web design et stratégie digitale pour faire grandir votre marque.",
  ],
  [
    "Expert insights on web design, branding,",
    "Conseils branding, web design",
  ],
  [
    "and strategy to help your business stand out.",
    "et stratégie digitale pour faire grandir votre marque.",
  ],
  ["Strategies & insights.", "Stratégies & conseils."],
  ["select category", "choisir une catégorie"],
  ["Recent Articles (15)", "Articles récents"],
  ["Cogni", "Branding"],
  ["Tenso", "Web"],
  ["MindX", "Social"],
  ["Pulse", "Pub"],
  ["GridX", "Contenu"],
  ["NovaA", "Stratégie"],
  [
    "Fragmented tools and manual coordination slowed execution as operational complexity increased.",
    "Des outils dispersés et une coordination manuelle ralentissaient la croissance de l'activité.",
  ],
  [
    "et les enseignements de déploiements réels.",
    "et les retours d'expérience de nos projets clients.",
  ],
  [
    "Conseils branding, stratégie digitale, réseaux sociaux,et les enseignements de déploiements réels.",
    "Conseils branding, stratégie digitale, réseaux sociaux et retours d'expérience de nos projets clients.",
  ],
];

const HTML_REPLACEMENTS: Replacement[] = [
  [
    "Automatisation &amp; Intelligence artificielle",
    "Social Media &amp; Contenus",
  ],
  [
    "Automatisation & Intelligence artificielle",
    "Social Media & Contenus",
  ],
  ["Création de workflows intelligents", "Calendrier éditorial & community management"],
  ["Automatisation des processus", "Stratégie éditoriale"],
  [
    "Gagnez du temps grâce à des systèmes plus intelligents. Nous automatisons vos tâches répétitives pour rendre votre entreprise plus efficace et scalable.",
    "Créez une communauté engagée autour de votre marque. Nous produisons des contenus qui racontent votre histoire et fidélisent votre audience.",
  ],
  [
    "Nous concevons et développons des systèmes d’IA qui s’intègrent",
    "Nous concevons des stratégies marketing sur mesure qui transforment votre visibilité",
  ],
  [
    "Nous concevons et développons des systèmes d'IA qui s'intègrent",
    "Nous concevons des stratégies marketing sur mesure qui transforment votre visibilité",
  ],
  [
    "dans de vrais workflows — de l’idée à la production.",
    "en croissance mesurable — de la stratégie à la mise en œuvre.",
  ],
  [
    "dans de vrais workflows — de l'idée à la production.",
    "en croissance mesurable — de la stratégie à la mise en œuvre.",
  ],
  [
    "Concevoir des systèmes",
    "Concevoir des marques",
  ],
  [
    "qui transforment le travail complexe en automatisation",
    "qui transforment la visibilité en croissance",
  ],
  [
    "De la stratégie de marque à l’automatisation, chaque étape",
    "De la stratégie de marque à la conversion, chaque étape",
  ],
  [
    "De la stratégie de marque à l'automatisation, chaque étape",
    "De la stratégie de marque à la conversion, chaque étape",
  ],
  ["Pas de battage médiatique. Juste des systèmes.", "Pas de jargon. Juste des résultats."],
  ["La clarté prime sur l’automatisation", "La clarté prime sur la complexité"],
  ["La clarté prime sur l'automatisation", "La clarté prime sur la complexité"],
  ["Des systèmes qui tiennent sous pression", "Des stratégies qui tiennent dans la durée"],
  [
    "Notes sur les systèmes d’IA, les choix d’architecture,",
    "Conseils branding, stratégie digitale, réseaux sociaux,",
  ],
  [
    "Notes sur les systèmes d'IA, les choix d'architecture,",
    "Conseils branding, stratégie digitale, réseaux sociaux,",
  ],
  [
    "et déployons des systèmes d’IA en conditions réelles.",
    "et déployons votre stratégie marketing de A à Z.",
  ],
  [
    "et déployons des systèmes d'IA en conditions réelles.",
    "et déployons votre stratégie marketing de A à Z.",
  ],
  [
    "Apportez votre système, votre workflow ou votre idée.",
    "Apportez votre projet, votre marque ou votre ambition.",
  ],
  [
    "Nous vous aiderons à comprendre ce qu’il faut pour le concevoir et le déployer.",
    "Nous vous aiderons à définir la meilleure stratégie pour la concrétiser.",
  ],
  [
    "Nous vous aiderons à comprendre ce qu'il faut pour le concevoir et le déployer.",
    "Nous vous aiderons à définir la meilleure stratégie pour la concrétiser.",
  ],
  ["Démarrer une conversation", "Démarrer un projet"],
  ["Conçu pour la réalité imparfaite", "Conçu pour la réalité du terrain"],
  ["Des décisions plutôt que des démos", "Les résultats avant les promesses"],
];

export function applyAgencyContent(text: string): string {
  let out = applyReplacements(text, SHARED_REPLACEMENTS);
  out = applyReplacements(out, HTML_REPLACEMENTS);

  out = out.replace(/\bAI systems\b/g, "stratégies marketing");
  out = out.replace(/\bAI system\b/g, "stratégie marketing");
  out = out.replace(/\bAI projects\b/g, "stratégies digitales");
  out = out.replace(/\bAI project\b/g, "stratégie digitale");
  out = out.replace(/\bAI initiatives\b/g, "initiatives marketing");
  out = out.replace(/\bAI initiative\b/g, "initiative marketing");
  out = out.replace(/\bAI-driven\b/g, "orientées performance");
  out = out.replace(/\bAI technology\b/g, "marketing digital");
  out = out.replace(/\boperational AI\b/gi, "marketing opérationnel");
  out = out.replace(/\bAI experiments\b/g, "tests marketing");
  out = out.replace(/\bAI experiment\b/g, "test marketing");
  out = out.replace(/\bAI deployments\b/g, "déploiements marketing");
  out = out.replace(/\bAI deployment\b/g, "déploiement marketing");
  out = out.replace(/\bAI workflows\b/g, "parcours marketing");
  out = out.replace(/\bAI workflow\b/g, "parcours marketing");
  out = out.replace(/\bAI decision systems\b/g, "stratégies de conversion");
  out = out.replace(/\bAI decision system\b/g, "stratégie de conversion");
  out = out.replace(/\bAI opportunities\b/g, "opportunités de croissance");
  out = out.replace(/\bAI opportunity\b/g, "opportunité de croissance");
  out = out.replace(/\bAI models\b/g, "messages de marque");
  out = out.replace(/\bAI model\b/g, "message de marque");
  out = out.replace(/\bAI processing\b/g, "traitement digital");
  out = out.replace(/\bartificial intelligence\b/gi, "marketing digital");
  out = out.replace(/\bIntelligence artificielle\b/g, "Marketing digital");
  out = out.replace(/\bintelligence artificielle\b/g, "marketing digital");
  out = out.replace(/\bLLMs\b/g, "contenus");
  out = out.replace(/\bLLM\b/g, "contenu");
  out = out.replace(/\bautonomous workflows\b/gi, "campagnes structurées");
  out = out.replace(/\bautonomous growth\b/gi, "croissance durable");
  out = out.replace(/\bautomation pipelines\b/gi, "stratégies intégrées");
  out = out.replace(/\bchat interfaces\b/gi, "présence digitale");
  out = out.replace(/\bdecision engines\b/gi, "stratégies de conversion");
  out = out.replace(/\bintelligence engines\b/gi, "identités de marque");
  out = out.replace(/\bworkflows intelligents\b/gi, "contenus engageants");
  out = out.replace(/\bsystèmes d’IA\b/g, "stratégies marketing");
  out = out.replace(/\bsystèmes d'IA\b/g, "stratégies marketing");
  out = out.replace(/\bsystème d’IA\b/g, "stratégie marketing");
  out = out.replace(/\bsystème d'IA\b/g, "stratégie marketing");

  return adaptContactForm(out);
}
