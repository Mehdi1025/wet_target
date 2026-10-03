function applyTextReplacements(text: string): string {
  let out = text;

  const replacements: Array<string[] | [string, string, string, string]> = [
    ["Créé par Forde lab® dans Framer", "Créé par Target Agency®"],
    ["Créé par Forde lab®", "Créé par Target Agency®"],
    ["Créé par Forde lab dans Framer", "Créé par Target Agency®"],
    ["Forde lab® dans Framer", "Target Agency®"],
    ["Forde lab®", "Target Agency®"],
    ["Forde lab", "Target Agency"],
    ["My Framer Site", "Target Agency"],
    [
      "Create a free website with Framer, the website builder loved by startups, designers and agencies.",
      "Target Agency — agence de marketing digital.",
    ],
    [
      "La landing page a été réalisée avec Framer, avec un parcours simple",
      "La landing page a été conçue avec un parcours simple",
    ],
    [
      "La landing page a été réalisée avec Framer",
      "La landing page a été conçue sur mesure",
    ],
    ["réalisée avec Framer", "conçue sur mesure"],
    ["realisée avec Framer", "conçue sur mesure"],
    ["conçues avec Framer", "conçues sur mesure"],
    ["concue avec Framer", "conçue sur mesure"],
    [" avec Framer", ""],
    [" dans Framer", ""],
    [" in Framer", ""],
    [" with Framer", ""],
    [">Framer</p>", "></p>"],
    [">Framer<", "><"],
    ['placeholder="jane@framer.com"', 'placeholder="target@contact.fr"'],
    ["jane@framer.com", "target@contact.fr"],
    ['"in","Framer",', ""],
    ['","Framer","', '","Next.js","'],
    ['"Framer","Tenso"', '"Next.js","Tenso"'],
    ['"Cogni","Framer"', '"React","Next.js"'],
    ['"Framer"', '"Next.js"'],
    ["Outils utilisés", "Framer", "Outils utilisés", "Next.js"],
    ["children:`Framer`", "children:`Next.js`"],
    ["displayName=`Framer`", "displayName=`Target`"],
    ["title:`Create a free website with Framer", "title:`Target Agency"],
    ["https://www.framer.com/r/badge/", "/"],
    ["href:`https://www.framer.com`", "href:`/`"],
    ["open(`https://www.framer.com", "open(`/`"],
  ];

  for (const entry of replacements) {
    if (entry.length === 2) {
      const [from, to] = entry;
      if (out.includes(from)) out = out.split(from).join(to);
    } else if (entry.length === 4) {
      const [a, b, , d] = entry;
      out = out.split(`${a}","${b}`).join(`${a}","${d}`);
      out = out.split(`${a}"," ${b}`).join(`${a}"," ${d}`);
    }
  }

  out = out.replace(/href="https:\/\/(www\.)?framer\.com[^"]*"/g, 'href="/"');
  out = out.replace(/title="[^"]*Framer[^"]*"/g, 'title="Target Agency"');

  return out;
}

const FOOTER_CREDIT_HIDE_STYLE =
  "<style>.framer-15n4xu0-container,.framer-x3d6bh-container,.framer-ttSuR[data-framer-name=\"Variant 1\"]{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important}</style>";

export function stripFooterCreditFromMjs(content: string): string {
  let out = content;

  const replacements: Array<[string, string]> = [
    ["children:`Créé par Forde lab® dans Framer`", "children:``"],
    [
      "FlLKJmPdi:`Framer`,height:`100%`,hTwxM0Xir:`avec`",
      "FlLKJmPdi:``,height:`100%`,hTwxM0Xir:``",
    ],
    ["FlLKJmPdi:`Framer`", "FlLKJmPdi:``"],
    ["FlLKJmPdi??`Framer`", "FlLKJmPdi??``"],
    ["hTwxM0Xir:`avec`", "hTwxM0Xir:``"],
    ["hTwxM0Xir??`in`", "hTwxM0Xir??``"],
    ["children:`Framer`", "children:``"],
    ["children:`Created by`", "children:``"],
    ["children:`in`", "children:``"],
    ["children:`Créé par`", "children:``"],
    ["sb_Z5ELAb??`Created by`", "sb_Z5ELAb??``"],
    ["RsOCYGwcT??`Forde lab®`", "RsOCYGwcT??``"],
    ["RsOCYGwcT:`Target Agency®`", "RsOCYGwcT:``"],
    ["sb_Z5ELAb:`Créé par`", "sb_Z5ELAb:``"],
    ["RsOCYGwcT:`Forde lab®`", "RsOCYGwcT:``"],
    ["sb_Z5ELAb:`Created by`", "sb_Z5ELAb:``"],
  ];

  for (const [from, to] of replacements) {
    if (out.includes(from)) out = out.split(from).join(to);
  }

  return out;
}

function removeFooterCreditHtml(html: string): string {
  if (
    html.includes("framer-15n4xu0-container{display:none") ||
    !html.includes("</head>")
  ) {
    return html;
  }

  return html.replace("</head>", `${FOOTER_CREDIT_HIDE_STYLE}</head>`);
}

export function stripFramerBranding(html: string): string {
  let out = html;

  out = out.replace(/<!-- Made in Framer[\s\S]*?-->\s*/g, "");
  out = out.replace(/<!-- Exported with NocodeXport[\s\S]*?-->\s*/g, "");
  out = out.replace(/<!-- Optimized[\s\S]*?-->\s*/g, "");
  out = out.replace(/<!-- Save money on hosting[\s\S]*?-->\s*/g, "");
  out = out.replace(/<!-- Published[\s\S]*?-->\s*/g, "");

  out = out.replace(/<meta name="generator" content="Framer[^"]*">\s*/g, "");

  out = out.replace(
    /<div id="__framer-badge-container">[\s\S]*?<\/div>\s*(?=<!--|<script|<\/body)/g,
    ""
  );

  out = out.replace(/<style>#__framer-badge-container[\s\S]*?<\/style>/g, "");
  out = out.replace(
    /<script>\(function\(\)\{var SEL='#__framer-badge-container[\s\S]*?\}\)\(\)<\/script>/g,
    ""
  );

  out = out.replace(
    /<!-- NoCodeXport Local Notice -->[\s\S]*?<!-- \/NoCodeXport Local Notice -->/g,
    ""
  );

  out = out.replace(
    /@supports\s*\(\s*z-index:\s*calc\(\s*infinity\s*\)\s*\)\s*\{[^}]*#__framer-badge-container[^}]*\}/g,
    ""
  );
  out = out.replace(/#__framer-badge-container\s*\{[^}]*\}/g, "");

  out = out.replace(/https:\/\/wearetarget\.framer\.website[^"']*/g, "/");
  out = out.replace(/https:\/\/[^"']*\.framer\.website[^"']*/g, "/");

  out = removeFooterCreditHtml(applyTextReplacements(out));

  return out;
}
