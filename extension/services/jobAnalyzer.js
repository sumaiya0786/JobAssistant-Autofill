// Extracts a best-effort job description from the current page and runs matching.
const JobAnalyzer = {
  extractFromPage() {
    // Prefer common JD containers, else fall back to main/article/body text.
    const selectors = [
      '[class*="job-description"]', '[class*="jobDescription"]', '[id*="job-description"]',
      '[data-testid*="description"]', 'article', 'main', '[role="main"]',
    ];
    let text = "";
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 200) {
        text = el.innerText.trim();
        break;
      }
    }
    if (!text) text = (document.body.innerText || "").trim().slice(0, 6000);

    const title =
      document.querySelector('h1')?.innerText?.trim() ||
      document.title.split("|")[0].split("-")[0].trim();

    return { title, description: text.slice(0, 6000), url: location.href };
  },

  async analyzeAndMatch({ title, description, url }) {
    return window.JA_Api.matchJob({ title, description, url });
  },
};

if (typeof window !== "undefined") window.JA_JobAnalyzer = JobAnalyzer;
