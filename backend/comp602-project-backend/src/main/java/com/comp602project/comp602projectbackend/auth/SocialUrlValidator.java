package com.comp602project.comp602projectbackend.auth;

import java.net.URI;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SocialUrlValidator {

    public enum Platform { LINKEDIN, GITHUB, INSTAGRAM }

    public record ValidatedSocial(Platform platform, String url) {}

    private static final Set<String> GITHUB_RESERVED = Set.of(
            "features", "about", "pricing", "login", "signup", "explore", "topics",
            "collections", "trending", "settings", "notifications", "marketplace",
            "sponsors", "customer-stories", "security", "team", "enterprise"
    );

    private static final Set<String> INSTAGRAM_BLOCKED = Set.of(
            "p", "reel", "reels", "stories", "explore", "accounts", "direct"
    );

    private SocialUrlValidator() {}

    /** Returns null for blank input, empty optional for invalid URLs. */
    public static ValidatedSocial validate(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String urlStr = raw.trim();
        if (!urlStr.matches("(?i)^https?://.*")) urlStr = "https://" + urlStr;

        URI uri;
        try {
            uri = URI.create(urlStr);
        } catch (IllegalArgumentException e) {
            return null;
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            return null;
        }

        String host = uri.getHost();
        if (host == null) return null;
        host = host.toLowerCase();
        if (host.startsWith("www.")) host = host.substring(4);

        String path = uri.getPath() == null ? "" : uri.getPath().replaceAll("/+$", "");

        if ("linkedin.com".equals(host)) {
            Matcher m = Pattern.compile("^/(in|company)/([^/?#]+)", Pattern.CASE_INSENSITIVE).matcher(path);
            if (m.find()) {
                String segment = m.group(1).toLowerCase();
                String slug = m.group(2);
                return new ValidatedSocial(Platform.LINKEDIN, "https://www.linkedin.com/" + segment + "/" + slug);
            }
            return null;
        }

        if ("github.com".equals(host)) {
            Matcher m = Pattern.compile("^/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)(?:/|$)").matcher(path);
            if (m.find()) {
                String username = m.group(1);
                if (!GITHUB_RESERVED.contains(username.toLowerCase())) {
                    return new ValidatedSocial(Platform.GITHUB, "https://github.com/" + username);
                }
            }
            return null;
        }

        if ("instagram.com".equals(host)) {
            Matcher m = Pattern.compile("^/([A-Za-z0-9._]{1,30})/?$").matcher(path);
            if (m.find()) {
                String username = m.group(1);
                if (!INSTAGRAM_BLOCKED.contains(username.toLowerCase())) {
                    return new ValidatedSocial(Platform.INSTAGRAM, "https://instagram.com/" + username);
                }
            }
            return null;
        }

        return null;
    }
}
