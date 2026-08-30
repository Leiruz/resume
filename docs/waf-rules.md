# WAF rules as code (sanitized)

Rule identities and integrity hashes for the zurielst.com zone. Full expressions are deliberately NOT published (they disclose defensive match conditions); they live in the owner's operational archive, and each expression's sha256 prefix here lets any future export be diff-verified against this manifest. Exported 2026-08-30.

## Custom firewall ruleset (phase http_request_firewall_custom)

### 1. Skip security for ACME challenge validation (incident fix 2026-08-30, permanent)

- action: skip; enabled: True; id: 87a5b1f9cdae4d0498bcda92956f5201
- expression sha256/16: 3e4359237f9d7046; length: 110 chars
- purpose: Exempts ACME HTTP-01 validation (GET/HEAD on /.well-known/acme-challenge/) from custom rules, Security Level, rate limiting, and managed rules so certificate renewals can never be challenged. Added 2026-08-30, permanent.

### 2. Block strict static-site exploit traffic v4.1

- action: block; enabled: True; id: 34bf3f07de894cabb7c13fcb153f56b2
- expression sha256/16: d29734ff669a0f2c; length: 3987 chars
- purpose: Blocks common exploit-path and payload probing against the static site.

### 3. Challenge command-line and scanner clients

- action: managed_challenge; enabled: True; id: 8f03b7f019a04b58a08547c55f8ccdb3
- expression sha256/16: c0436144d4fc4b59; length: 777 chars
- purpose: Serves a managed challenge to empty-UA and known scanner command-line clients; exempts verified bots.

### 4. Challenge non-read HTTP methods

- action: managed_challenge; enabled: True; id: 6c23289a044649558a04644dfab4c4a1
- expression sha256/16: 94dcc2cb2ea00afe; length: 228 chars
- purpose: Serves a managed challenge to non-read HTTP methods zone-wide.

## Rate limiting ruleset (phase http_ratelimit)

### Rate limit AI assistant - block bursts

- action: block; enabled: True; id: 0887e840f57b40bc9e8e1ecbfffd4928
- expression sha256/16: ff5c004fbed4ca3e; ratelimit: {"characteristics":["ip.src","cf.colo.id"],"mitigation_timeout":10,"period":10,"requests_per_period":8}
- purpose: Rate-limits the legacy AI assistant path. Slot is reassigned to the new chat endpoint at the rebuild cutover.

## Temporary configuration rule (phase http_config_settings)

- TEMP incident rule scoping SSL mode Full to zurielst.com + www while GitHub Pages certificates re-issue. TO DELETE once certificates are healthy; deleting it restores uniform Full (strict). Recorded in the incident report.

## Response headers transform ruleset

- Exists on the zone (phase http_response_headers_transform); export pending a token scope that can read it. Follow-up in the incident report.
