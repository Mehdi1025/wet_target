const FEATURED_CASES_SCRIPT =
  '<script src="/assets/featured-cases-scroll.js" defer></script>';

const HOME_PATHS = new Set(["index.html", "fr/index.html"]);

export function injectSiteScripts(html: string, filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const isHome = [...HOME_PATHS].some((path) => normalized.endsWith(path));
  if (!isHome) return html;
  if (html.includes("featured-cases-scroll.js")) return html;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${FEATURED_CASES_SCRIPT}</body>`);
  }

  return html + FEATURED_CASES_SCRIPT;
}
