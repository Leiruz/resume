# WAF rules as code: zurielst.com

The Cloudflare zone is the source of truth; this file mirrors the exported state from 2026-08-30 (`incident-export/waf_custom_ruleset.json`, `ratelimit_ruleset.json`, `TEMP_config_settings_ruleset.json`, `zone_settings_snapshot.json`). Any change to a zone rule must update this file in the same PR and must be followed by the regression matrix in `runbook.md`.

Zone settings context at export (`zone_settings_snapshot.json`): ssl `strict` (Full strict), security_level `essentially_off`, always_use_https `on`, min_tls_version `1.3`, automatic_https_rewrites `on`.

Free plan capacity: 5 custom rule slots, 4 in use.

Host coverage note: rules 2 to 4 enumerate `zurielst.com`, `www.zurielst.com`, `citadel.zurielst.com`, and `towerblock.zurielst.com`. `ngeeannbadminton.zurielst.com` is not in the lists (it currently has no DNS record either); if that host is ever brought back, add it to each host list.

## Custom ruleset (phase `http_request_firewall_custom`)

Ruleset id `33fcf17ee57d4e3d9211fd342982b067`, version 19 at export. Rules evaluate top to bottom; the ACME skip rule must stay at position 1.

### Rule 1: Skip security for ACME challenge validation

- Name: "Skip security for ACME challenge validation (incident fix 2026-08-30, permanent)"
- Action: `skip` (logging enabled)
- Position: 1 (must remain first)
- Rule id at export: `87a5b1f9cdae4d0498bcda92956f5201`

Expression:

```
(starts_with(http.request.uri.path, "/.well-known/acme-challenge/") and http.request.method in {"GET" "HEAD"})
```

Skip targets (action_parameters): all remaining rules of this ruleset (`ruleset: current`); the phases `http_ratelimit` and `http_request_firewall_managed`; the products `securityLevel` (Security Level, including Under Attack Mode), `bic` (Browser Integrity Check), `hot` (Hotlink Protection), `uaBlock` (User Agent Blocking), `zoneLockdown` (Zone Lockdown).

What it protects: Let's Encrypt HTTP-01 validation, which GitHub Pages uses to issue and renew the origin certificates for every host on this zone. The `securityLevel` skip is the load-bearing part: Under Attack Mode challenging these validators is what caused the July to August 2026 outage (`incident-2026-08.md`). Scope is tight by construction: read-only methods on one well-known path prefix that serves nothing but challenge tokens; it applies to all hosts on the zone.

Change history: added 2026-08-30 as the incident fix. Permanent; never delete, disable, or move below other rules.

### Rule 2: Block strict static-site exploit traffic v4.1 (R1)

- Name: "Block strict static-site exploit traffic v4.1"
- Action: `block`
- Position: 2
- Rule id at export: `34bf3f07de894cabb7c13fcb153f56b2`

Expression:

```
(
lower(http.host) in {"zurielst.com" "www.zurielst.com" "citadel.zurielst.com" "towerblock.zurielst.com"}
and not starts_with(http.request.uri.path, "/cdn-cgi/")
and not (
  lower(http.host) in {"zurielst.com" "www.zurielst.com"}
  and starts_with(lower(http.request.uri.path), "/ai/")
  and http.request.method in {"GET" "POST" "OPTIONS"}
)
and
(
raw.http.request.uri.query ne ""
or len(raw.http.request.uri) gt 2048
or len(raw.http.request.uri.path) gt 512
or http.request.uri.path.extension in {"php" "phtml" "phar" "asp" "aspx" "jsp" "cgi" "pl" "py" "rb" "env" "config" "sql" "bak" "old" "backup"}
or lower(raw.http.request.uri) contains "%00"
or lower(raw.http.request.uri) contains "%0a"
or lower(raw.http.request.uri) contains "%0d"
or lower(raw.http.request.uri) contains "%2f"
or lower(raw.http.request.uri) contains "%5c"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".php"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".asp"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".jsp"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".cgi"
or lower(url_decode(raw.http.request.uri, "ur")) contains ";"
or lower(url_decode(raw.http.request.uri, "ur")) contains "<"
or lower(url_decode(raw.http.request.uri, "ur")) contains ">"
or lower(url_decode(raw.http.request.uri, "ur")) contains "&lt;"
or lower(url_decode(raw.http.request.uri, "ur")) contains "&gt;"
or lower(url_decode(raw.http.request.uri, "ur")) contains "&#"
or lower(url_decode(raw.http.request.uri, "ur")) contains "../"
or lower(url_decode(raw.http.request.uri, "ur")) contains "..\\"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/etc/"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/proc/"
or lower(url_decode(raw.http.request.uri, "ur")) contains "win.ini"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".env"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".git"
or lower(url_decode(raw.http.request.uri, "ur")) contains ".svn"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/server-status"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/wp-"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/xmlrpc"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/phpmyadmin"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/cgi-bin"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/vendor/"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/admin"
or lower(url_decode(raw.http.request.uri, "ur")) contains "/login"
or url_decode(raw.http.request.uri, "ur") wildcard "*j*a*v*a*s*c*r*i*p*t*:*"
or url_decode(raw.http.request.uri, "ur") wildcard "*v*b*s*c*r*i*p*t*:*"
or url_decode(raw.http.request.uri, "ur") wildcard "*d*a*t*a*:*t*e*x*t*/*h*t*m*l*"
or url_decode(raw.http.request.uri, "ur") wildcard "*o*n*e*r*r*o*r*=*"
or url_decode(raw.http.request.uri, "ur") wildcard "*o*n*l*o*a*d*=*"
or lower(url_decode(raw.http.request.uri, "ur")) contains "union select"
or lower(url_decode(raw.http.request.uri, "ur")) contains "sleep("
or lower(url_decode(raw.http.request.uri, "ur")) contains "benchmark("
or lower(url_decode(raw.http.request.uri, "ur")) contains "base64_decode"
or lower(url_decode(raw.http.request.uri, "ur")) contains "cmd.exe"
or lower(url_decode(raw.http.request.uri, "ur")) contains "powershell"
or lower(url_decode(raw.http.request.uri, "ur")) contains "${jndi:"
or lower(url_decode(raw.http.request.uri, "ur")) contains "ldap://"
or lower(url_decode(raw.http.request.uri, "ur")) contains "gopher://"
or lower(url_decode(raw.http.request.uri, "ur")) contains "file://"
or lower(url_decode(http.user_agent, "ur")) contains "<script"
or lower(url_decode(http.user_agent, "ur")) contains "${jndi:"
or lower(url_decode(http.referer, "ur")) contains "<script"
or lower(url_decode(http.referer, "ur")) contains "${jndi:"
or lower(url_decode(http.cookie, "ur")) contains "<script"
or lower(url_decode(http.cookie, "ur")) contains "${jndi:"
)
)
```

What it protects: the origin is a static site that legitimately serves no query strings, no server-side extensions, and no dynamic endpoints, so the rule hard-blocks query strings, oversized URIs, server-side file extensions, encoded control characters, path traversal, XSS and SQL injection probes, log4shell patterns, and CMS scanner paths, checked in the URI, User-Agent, Referer, and Cookie after URL decoding. Carve-outs: `/cdn-cgi/` (Cloudflare's own paths) and GET/POST/OPTIONS on `/ai/` for apex and www (the AI assistant Worker route). Typical volume around 1.7k blocked requests per day (observed May to August 2026).

Change history: rule version 7 at export, last modified 2026-05-15 (v4.1). Not changed by the 2026-08-30 incident fix.

### Rule 3: Challenge command-line and scanner clients (R2)

- Name: "Challenge command-line and scanner clients"
- Action: `managed_challenge`
- Position: 3
- Rule id at export: `8f03b7f019a04b58a08547c55f8ccdb3`

Expression:

```
(
  lower(http.host) in {"zurielst.com" "www.zurielst.com" "citadel.zurielst.com" "towerblock.zurielst.com"}
  and not starts_with(http.request.uri.path, "/cdn-cgi/")
  and not cf.client.bot
  and
  (
    http.user_agent eq ""
    or lower(http.user_agent) contains "curl"
    or lower(http.user_agent) contains "wget"
    or lower(http.user_agent) contains "python-requests"
    or lower(http.user_agent) contains "go-http-client"
    or lower(http.user_agent) contains "libwww-perl"
    or lower(http.user_agent) contains "nikto"
    or lower(http.user_agent) contains "sqlmap"
    or lower(http.user_agent) contains "zgrab"
    or lower(http.user_agent) contains "masscan"
    or lower(http.user_agent) contains "nmap"
    or lower(http.user_agent) contains "acunetix"
  )
)
```

What it protects: filters low-effort automation by challenging empty User-Agents and common CLI, HTTP-library, and scanner User-Agents, while exempting Cloudflare-verified bots (`cf.client.bot`, which covers legitimate crawlers) and `/cdn-cgi/`. This rule is why default-UA curl is expected to receive `cf-mitigated: challenge` in the regression matrix; that outcome is a pass, not a failure.

Change history: rule version 3 at export, last modified 2026-05-14. Not changed by the 2026-08-30 incident fix.

### Rule 4: Challenge non-read HTTP methods (R3)

- Name: "Challenge non-read HTTP methods"
- Action: `managed_challenge`
- Position: 4
- Rule id at export: `6c23289a044649558a04644dfab4c4a1`

Expression:

```
(
  lower(http.host) in {"zurielst.com" "www.zurielst.com" "citadel.zurielst.com" "towerblock.zurielst.com"}
  and not starts_with(http.request.uri.path, "/cdn-cgi/")
  and not (http.request.method in {"GET" "HEAD" "OPTIONS"})
)
```

What it protects: the static origin accepts no writes, so every method other than GET, HEAD, and OPTIONS gets a managed challenge. Note that POST to the `/ai/` Worker path is currently covered by this rule too; any future same-origin POST API endpoint needs an explicit carve-out here.

Change history: rule version 3 at export, last modified 2026-05-14. Not changed by the 2026-08-30 incident fix.

## Rate limiting ruleset (phase `http_ratelimit`)

Ruleset id `8906eb2ce54445b7a83cb62448ceb0fa`, version 3 at export.

### Rule: Rate limit AI assistant - block bursts

- Name: "Rate limit AI assistant - block bursts"
- Action: `block` on trip
- Position: 1 (only rule in the phase)
- Rule id at export: `0887e840f57b40bc9e8e1ecbfffd4928`

Expression:

```
starts_with(http.request.uri.path, "/ai/")
```

Rate limit parameters: more than 8 requests per 10 seconds per (`ip.src`, `cf.colo.id`) blocks for 10 seconds (`mitigation_timeout`).

What it protects: the Workers AI chatbot behind the `/ai/` route, capping per-IP bursts so one client cannot burn the free-tier AI quota. The ACME skip rule (custom ruleset, rule 1) skips this whole phase for ACME paths; there is no overlap anyway since the path prefixes differ.

Change history: rule version 3 at export, last modified 2026-05-15. Not changed by the 2026-08-30 incident fix.

## Temporary configuration rule (phase `http_config_settings`): TO DELETE

WARNING: this rule is temporary incident mitigation, not part of the steady-state rule set. Delete it once every Pages repo reports a healthy `https_certificate` with a future `expires_at` (`runbook.md`, "If the site shows 526", step 6). Deleting it restores uniform SSL Full (strict) from the zone setting. Do not copy it into any rules-as-code sync as a permanent rule.

- Name: "TEMP incident fix 2026-08-30: SSL Full for apex+www while GitHub Pages cert re-issues. DELETE after cert healthy (runbook A5)."
- Action: `set_config` with `ssl: full`
- Position: 1 (only rule in the phase)
- Rule id at export: `82a0f48d538f47b284851f827d7760a4`
- Created: 2026-08-30T04:30:25Z

Expression:

```
(http.host in {"zurielst.com" "www.zurielst.com"})
```

What it does: downgrades origin certificate validation from Full (strict) to Full (encrypt without validating) for the apex and www only, so visitors get the site instead of error 526 while GitHub re-issues the expired origin certificates. The zone default remains `strict`; citadel and towerblock stay under strict and keep returning 526 until their own certificates issue.

Change history: added 2026-08-30 as incident fix step 3 (`incident-2026-08.md`). Scheduled for deletion; its removal should be recorded here.

## Not yet exported: response headers transform ruleset

A response headers transform ruleset (phase `http_response_headers_transform`) exists on this zone, but its export file (`incident-export/response_headers_transform_ruleset.json`) is empty: the scoped token used for the 2026-08-30 incident work lacked the read scope for that phase. Re-export it with a token that includes the scope and document its rules here (incident report follow-up 4). Until then, treat that ruleset as undocumented and change it only from the dashboard with a manual note added here.
