# Incident report: zurielst.com outage, July to August 2026

Evidence file names cited below refer to the zone state export taken 2026-08-30
(`incident-export/`): `dns_records.json`, `waf_custom_ruleset.json`,
`ratelimit_ruleset.json`, `TEMP_config_settings_ruleset.json`,
`zone_settings_snapshot.json`, and `pages_resume.json` / `pages_citadel.json` /
`pages_towerblock.json` / `pages_ngeeannbadminton.json`.

## Summary

zurielst.com and its GitHub Pages subdomains went down behind Cloudflare error 526 after the origin TLS certificates expired on 2026-07-31.
The certificates expired because Under Attack Mode, enabled around late June 2026, challenged every request, including the Let's Encrypt validators GitHub Pages uses to renew.
Fixed on 2026-08-30 via a scoped Cloudflare API token: a permanent WAF skip rule for the ACME path, a temporary SSL mode override for apex and www, and per-repo certificate re-provisioning; uniform Full (strict) returns once certificates are healthy.

## Impact

- Site unreachable for visitors. Two phases:
  - Challenge-wall degradation, approximately late June 2026 to 2026-08-30: every visitor got a "Just a moment" managed challenge interstitial before any page. Human browsers could pass it; automated clients, including Let's Encrypt validators, could not.
  - Hard outage, 2026-07-31 to 2026-08-30 (about 30 days): after the origin certificates expired, SSL mode Full (strict) returned Cloudflare error 526 to every visitor of zurielst.com and www.zurielst.com. towerblock.zurielst.com failed origin TLS validation the same way (`pages_towerblock.json`: cert expired 2026-07-31); citadel.zurielst.com had no origin certificate object at all by export time.
- ngeeannbadminton.zurielst.com had no DNS record in the zone (`dns_records.json`, exported pre-fix) and did not resolve at all; this predates the incident window. Its CNAME was restored on 2026-08-30 during the fix.
- Email was unaffected: the MX and mail TXT records are DNS-only (not proxied), so they sit outside both the challenge wall and origin TLS validation (`dns_records.json`).

## Timeline

| Date | Event |
| --- | --- |
| 2026-05-14/15 | Baseline: DNS records and WAF custom rules R1/R2/R3 created (`dns_records.json` created_on, `waf_custom_ruleset.json` rule timestamps). |
| ~late June 2026 | Under Attack Mode enabled. Every request to the zone, including Let's Encrypt HTTP-01 validators, receives a managed challenge. |
| July 2026 | GitHub Pages certificate renewals fail: `https_certificate.state = "bad_authz"` ("The ACME authorization is in a bad state. We need to start over.", preserved in `pages_towerblock.json`). |
| 2026-07-31 | Certificates for zurielst.com and towerblock.zurielst.com expire. With zone SSL mode Full (strict), all visitor traffic gets error 526. |
| 2026-08-30 | User disables Under Attack Mode (`zone_settings_snapshot.json`: security_level now essentially_off). The challenge wall goes away; browsers now reach the 526 directly. |
| 2026-08-30 04:30:22 UTC | Fix step 1: TXT record `_github-pages-challenge-leiruz.zurielst.com` created for GitHub domain verification (`dns_records.json`). |
| 2026-08-30 04:30:23 UTC | Fix step 2: permanent ACME skip rule added at position 1 of the WAF custom ruleset (`waf_custom_ruleset.json`). |
| 2026-08-30 04:30:25 UTC | Fix step 3: temporary Configuration Rule scopes SSL mode Full to zurielst.com and www (`TEMP_config_settings_ruleset.json`). Site returns HTTP 200 immediately after. |
| 2026-08-30 onward | Fix step 4: certificate re-provisioning for all four Pages repos via the cname detach/reattach cycle (runbook, "Certificate re-provisioning"). |

## Root cause

A five-link chain, each link necessary:

1. Under Attack Mode was enabled around late June 2026, serving a managed challenge to every request on the zone.
2. The challenge intercepted Let's Encrypt HTTP-01 validation requests to `/.well-known/acme-challenge/`. A certificate validator cannot solve a browser challenge.
3. GitHub Pages therefore could not renew its certificates: `https_certificate.state` went to `bad_authz`, and the certificates for zurielst.com and towerblock.zurielst.com expired on 2026-07-31 (`pages_towerblock.json` preserves the failed state; the expired apex certificate was confirmed by a direct TLS probe to 185.199.108.153 with SNI zurielst.com, which returned an expired-certificate error). citadel.zurielst.com and ngeeannbadminton.zurielst.com had no certificate object at all (`pages_citadel.json`, `pages_ngeeannbadminton.json`).
4. Zone SSL mode Full (strict) validates the origin certificate on every proxied request (`zone_settings_snapshot.json`: ssl = strict), so the expired origin certificate became Cloudflare error 526 for every visitor.
5. Disabling Under Attack Mode on 2026-08-30 removed the challenge wall but did nothing for the certificate, so the 526 persisted until origin certificate validation was temporarily scoped down while certificates re-issue.

## What made it worse

- Full (strict) with no certificate monitoring. Strict validation is the correct end state, but it converts an origin certificate lapse into a total outage, and nothing alerted when renewal started failing weeks before expiry.
- Unverified domain. All four Pages repos show `protected_domain_state: "unverified"` (`pages_*.json`). Ownership of the domain was never verified with GitHub, which leaves a takeover window whenever a custom domain is detached, and made the certificate fix riskier until the verification TXT record landed.
- No monitoring. No synthetic check watched the site, so the challenge wall ran for about five weeks and the 526 for about 30 days before a human noticed and traced it.

## Fix applied

Executed 2026-08-30 via a user-minted, scoped Cloudflare API token (DNS and zone WAF write scopes only). Steps in order:

1. Domain verification TXT record, before touching anything else, to close the takeover window: created `_github-pages-challenge-leiruz.zurielst.com` (TXT, DNS-only, comment "GitHub Pages domain verification (incident fix 2026-08-30)"; `dns_records.json`). The record value is intentionally not reproduced here; it is visible in public DNS. The record is kept permanently. Completing verification on the GitHub side is follow-up 2.
2. Permanent WAF skip rule at position 1 of the custom ruleset (`waf_custom_ruleset.json`, rule id `87a5b1f9cdae4d0498bcda92956f5201`, description "Skip security for ACME challenge validation (incident fix 2026-08-30, permanent)"). Expression: GET/HEAD requests whose path starts with `/.well-known/acme-challenge/`. It skips all remaining custom rules, the rate limiting and managed rules phases, and the Security Level, Browser Integrity Check, Hotlink Protection, User Agent Blocking, and Zone Lockdown products, with logging enabled. The Security Level skip is the load-bearing part: it makes any future Under Attack Mode window safe for certificate renewal. Full text in `waf-rules.md`.
3. Temporary Configuration Rule (`TEMP_config_settings_ruleset.json`, rule id `82a0f48d538f47b284851f827d7760a4`): sets SSL mode to Full (encrypt to origin without validating its certificate) for zurielst.com and www.zurielst.com only. The zone default stays Full (strict) (`zone_settings_snapshot.json`). The site returned HTTP 200 immediately after this rule deployed. The rule is marked TO DELETE once GitHub reports healthy certificates, which restores uniform Full (strict).
4. Certificate re-provisioning for all four Pages repos (Leiruz/resume, Leiruz/CiTaDel, Leiruz/TowerBlock, Leiruz/NgeeAnnBadminton): detach and reattach the custom domain via `gh api` PUT of `cname: null` then PUT of the original cname, then poll `https_certificate.state`. Never DELETE `/pages`, which deletes the whole site. Procedure and per-repo notes in `runbook.md`, "Certificate re-provisioning".

## Follow-ups

1. Restore uniform Full (strict): delete the temporary Configuration Rule once `https_certificate.state` is healthy with a future expiry for all repos, then re-run the regression matrix (`runbook.md`).
2. Verify the domain on GitHub: complete verification in the Leiruz profile settings using the TXT record, confirm `protected_domain_state` becomes verified, and keep the TXT record forever.
3. Scheduled canary: a GitHub Action that runs the regression matrix plus a certificate expiry check for all hosts on a schedule and fails loudly by email. This incident ran unnoticed for a month; a canary caps that at one schedule interval.
4. Export the response headers transform ruleset: `response_headers_transform_ruleset.json` in the export is empty because the scoped incident token lacked the read scope for that phase. The ruleset exists on the zone; re-export it with a token that includes the scope and fold it into `waf-rules.md`.
5. Rules-as-code in the repo: commit `waf-rules.md` and the JSON exports, and keep them in sync with every future zone change.
