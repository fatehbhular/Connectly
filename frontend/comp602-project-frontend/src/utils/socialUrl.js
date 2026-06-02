const GITHUB_RESERVED = new Set([
  "features", "about", "pricing", "login", "signup", "explore", "topics",
  "collections", "trending", "settings", "notifications", "marketplace",
  "sponsors", "customer-stories", "security", "team", "enterprise",
]);

export function getUserSocial(user) {
  if (!user) return null;
  const linkedin = user.linkedinUrl?.trim();
  if (linkedin) return { url: linkedin, platform: "linkedin", label: "LinkedIn profile" };
  const github = user.githubUrl?.trim();
  if (github) return { url: github, platform: "github", label: "GitHub profile" };
  const instagram = user.instagramUrl?.trim();
  if (instagram) return { url: instagram, platform: "instagram", label: "Instagram profile" };
  return null;
}

export function parseSocialUrl(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return { valid: true, empty: true, url: "", platform: null, label: null };

  let urlStr = trimmed;
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;

  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const path = parsed.pathname.replace(/\/+$/, "") || "/";

  if (host === "linkedin.com") {
    const match = path.match(/^\/(in|company)\/([^/?#]+)/i);
    if (match) {
      const slug = match[2];
      const url = `https://www.linkedin.com/${match[1].toLowerCase()}/${slug}`;
      return { valid: true, url, platform: "linkedin", label: "LinkedIn profile" };
    }
    return { valid: false };
  }

  if (host === "github.com") {
    const match = path.match(/^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)(?:\/|$)/);
    if (match && !GITHUB_RESERVED.has(match[1].toLowerCase())) {
      return { valid: true, url: `https://github.com/${match[1]}`, platform: "github", label: "GitHub profile" };
    }
    return { valid: false };
  }

  if (host === "instagram.com") {
    const match = path.match(/^\/([A-Za-z0-9._]{1,30})\/?$/);
    const blocked = new Set(["p", "reel", "reels", "stories", "explore", "accounts", "direct"]);
    if (match && !blocked.has(match[1].toLowerCase())) {
      return { valid: true, url: `https://instagram.com/${match[1]}`, platform: "instagram", label: "Instagram profile" };
    }
    return { valid: false };
  }

  return { valid: false };
}

export const SOCIAL_URL_ERROR =
  "Enter a valid LinkedIn, GitHub, or Instagram profile link.";
