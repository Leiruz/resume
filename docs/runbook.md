# Runbook: zurielst.com operations

Purpose: operational procedures for zurielst.com and its GitHub Pages subdomains behind Cloudflare, written after the July to August 2026 certificate outage (`incident-2026-08.md`). Rule inventory and exact expressions live in `waf-rules.md`.

Hosts and origins:

| Host | Origin repo | Pages evidence file |
| --- | --- | --- |
| zurielst.com (and www, which 301s to apex) | Leiruz/resume | `pages_resume.json` |
| citadel.zurielst.com | Leiruz/CiTaDel | `pages_citadel.json` |
| towerblock.zurielst.com | Leiruz/TowerBlock | `pages_towerblock.json` |
| ngeeannbadminton.zurielst.com | Leiruz/NgeeAnnBadminton | `pages_ngeeannbadminton.json` |

Commands below are bash (Git Bash works on Windows). In PowerShell, replace `/dev/null` with `NUL` and `$(date +%s)` with `$(Get-Random)`. `$ZONE_ID` is the Cloudflare zone id for zurielst.com; `$CF_API_TOKEN` is a scoped API token you mint for the task and revoke after.

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
```

## If the site shows 526

526 means Cloudflare rejected the origin's TLS certificate under SSL mode Full (strict). The origin is GitHub Pages, so this is almost always an expired or missing GitHub-issued certificate.

1. Confirm and scope the failure:

   ```bash
   for h in zurielst.com www.zurielst.com citadel.zurielst.com towerblock.zurielst.com; do
     printf "%s " "$h"; curl -sS -o /dev/null -w "%{http_code}\n" -A "$UA" "https://$h/"
   done
   ```

2. Check the origin certificate state for each failing host's repo:

   ```bash
   gh api repos/Leiruz/resume/pages --jq '.https_certificate'
   ```

   Bad states: `bad_authz`, `errored`, an `expires_at` in the past, or the `https_certificate` object missing entirely.

3. Check why issuance is failing before touching anything:
   - The ACME skip rule must be present, enabled, and at position 1 of the WAF custom ruleset (`waf-rules.md`, rule 1). Dashboard: Security, WAF, Custom rules. API: `GET /zones/$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint`.
   - The zone security level must not be `under_attack` (see the next procedure).
   - Probe the ACME path; it must return 404 with no challenge:

   ```bash
   curl -sS -o /dev/null -D - "https://zurielst.com/.well-known/acme-challenge/probe-$(date +%s)" | grep -iE "^HTTP|cf-mitigated"
   ```

4. Stopgap restore, only while certificates re-issue: add a Configuration Rule that sets SSL mode to Full for the affected hosts only. Never downgrade the zone-wide SSL setting. The rule description must carry TEMP, the date, and the delete condition (see the 2026-08-30 rule in `waf-rules.md` for the exact shape).

   ```bash
   # find the http_config_settings ruleset id
   curl -sS -H "Authorization: Bearer $CF_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_config_settings/entrypoint"
   # add the TEMP rule
   curl -sS -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
     "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules" \
     --data '{
       "action": "set_config",
       "action_parameters": { "ssl": "full" },
       "expression": "(http.host in {\"zurielst.com\" \"www.zurielst.com\"})",
       "description": "TEMP incident fix YYYY-MM-DD: SSL Full for apex+www while GitHub Pages cert re-issues. DELETE after cert healthy.",
       "enabled": true
     }'
   ```

   Verify recovery immediately: the browser-UA check from step 1 should now return 200.

5. Re-provision the certificate (next-but-one section).

6. Exit condition: every repo reports a healthy `https_certificate` with a future `expires_at`. Then delete the TEMP rule (restores uniform Full strict) and run the full regression matrix:

   ```bash
   curl -sS -X DELETE -H "Authorization: Bearer $CF_API_TOKEN" \
     "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$RULE_ID"
   ```

## If visitors see "Just a moment" challenges

"Just a moment" is the Cloudflare managed challenge interstitial. Some challenges here are by design; zone-wide challenges for humans are not.

1. Attribute the challenge with the `Cf-Mitigated` response header:

   ```bash
   curl -sS -o /dev/null -D - -A "$UA" "https://zurielst.com/" | grep -iE "^HTTP|cf-mitigated"
   ```

   `cf-mitigated: challenge` on a plain browser-UA GET means a zone-wide product is challenging humans. That is an incident.

2. Check the zone security level. Dashboard: Security, Settings. API: `GET /zones/$ZONE_ID/settings/security_level`. `under_attack` means Under Attack Mode is on; that caused the 2026-08 outage by also challenging Let's Encrypt validators.

3. If Under Attack Mode is intentional (an active attack), first confirm the ACME skip rule is in place and enabled ("Never do" list), keep the window as short as possible, and note a calendar reminder to turn it off.

4. If not intentional, set the security level back (it was `essentially_off` as of 2026-08-30, `zone_settings_snapshot.json`), then run the regression matrix.

5. If only command-line clients are challenged (default curl, wget, scanners), that is rule R2 working as intended. No action.

## Certificate re-provisioning

Use when `https_certificate.state` is `bad_authz`, expired, or missing for a repo. This cycles the custom domain to make GitHub start a fresh Let's Encrypt order. It never touches the Pages site resource itself.

Repos and domains:

| Repo | Custom domain (cname value) |
| --- | --- |
| Leiruz/resume | zurielst.com |
| Leiruz/CiTaDel | citadel.zurielst.com |
| Leiruz/TowerBlock | towerblock.zurielst.com |
| Leiruz/NgeeAnnBadminton | ngeeannbadminton.zurielst.com |

Preconditions, all checked first:

- ACME skip rule present, enabled, position 1 (`waf-rules.md`).
- Zone security level not `under_attack`.
- The host's DNS record exists and stays proxied (orange cloud). HTTP-01 passes through the proxy because of the skip rule; grey-clouding is not needed and is dangerous while the origin cert is bad.
- No CAA record blocking letsencrypt.org (none exist in `dns_records.json` as of 2026-08-30).
- Note: `dns_records.json` (exported before the fix) contains no record for ngeeannbadminton.zurielst.com; its CNAME to leiruz.github.io was restored on 2026-08-30 as part of the fix, so the cycle can proceed.

Procedure, one repo at a time (example: TowerBlock):

1. Detach the custom domain. `-F` sends a typed JSON null:

   ```bash
   gh api -X PUT repos/Leiruz/TowerBlock/pages -F cname=null
   ```

2. Reattach the original domain:

   ```bash
   gh api -X PUT repos/Leiruz/TowerBlock/pages -f cname=towerblock.zurielst.com
   ```

3. Poll every few minutes. Do not repeat the detach/reattach:

   ```bash
   gh api repos/Leiruz/TowerBlock/pages --jq '[.status, .https_certificate.state, .https_certificate.expires_at]'
   ```

   Transitional states (`new`, `authorization_created`, `authorization_pending`, `authorized`, `issued`) are normal. Healthy end state: `approved` with an `expires_at` roughly 90 days out and `status` = `built`.

4. If the state lands back in `bad_authz` or sits pending for more than an hour, stop. Re-run the ACME path probe (526 procedure, step 3) and fix whatever challenges or blocks it. Do not loop the cycle; GitHub rate-limits Pages certificate orders and can flag rapid churn.

5. Confirm `https_enforced` is true afterwards; re-enable Enforce HTTPS in the repo's Pages settings if it dropped during the cycle.

## Regression matrix

Run after any zone change (WAF, DNS proxy flags, SSL settings, page rules, rulesets), after certificate re-provisioning, and on schedule via the canary. All checks use GET.

| # | Check | Expected |
| --- | --- | --- |
| 1 | Browser-UA GET on apex, citadel, towerblock | 200, no `Cf-Mitigated` header |
| 2 | Browser-UA GET on www | 301 to `https://zurielst.com/` with path preserved, no `Cf-Mitigated` |
| 3 | Default-UA curl GET on apex | 403 with `cf-mitigated: challenge` (scanner rule R2 intact) |
| 4 | ACME path with a nonce token, default UA | 404, no `cf-mitigated`, GitHub Pages 404 body (origin-style, never a challenge) |
| 5 | Exploit-path probe, browser UA | 403 with `cf-mitigated: block` (rule R1 intact) |

```bash
# 1 and 2: human path
for h in zurielst.com www.zurielst.com citadel.zurielst.com towerblock.zurielst.com; do
  echo "== $h"; curl -sS -o /dev/null -D - -A "$UA" "https://$h/" | grep -iE "^HTTP|^location|cf-mitigated"
done

# 3: scanner path must still be challenged
curl -sS -o /dev/null -D - "https://zurielst.com/" | grep -iE "^HTTP|cf-mitigated"

# 4: ACME path must reach the origin, never a challenge
curl -sS -D - "https://zurielst.com/.well-known/acme-challenge/regression-$(date +%s)" | grep -iE "^HTTP|cf-mitigated|github"

# 5: exploit probe must still be blocked
curl -sS -o /dev/null -D - -A "$UA" "https://zurielst.com/wp-login.php" | grep -iE "^HTTP|cf-mitigated"
```

Notes:

- Checks 1 for citadel and towerblock pass only once their certificates have re-issued; while a TEMP SSL rule covers only apex and www, those hosts still return 526.
- A missing `cf-mitigated` line in checks 1, 2, and 4 is the pass condition; its presence in checks 3 and 5 is the pass condition.

## Never do

- Never `DELETE /repos/{owner}/{repo}/pages`. That deletes the entire Pages site, not just the custom domain. Detach with `PUT` and `cname: null`.
- Never grey-cloud (unproxy) a host while the origin certificate is expired. Visitors would hit the expired GitHub certificate directly with nothing in front of it.
- Never re-enable Under Attack Mode without the ACME skip rule in place and enabled at position 1. Under Attack Mode challenges Let's Encrypt validators; without the skip, the 2026-08 outage recurs at the next renewal window.
- Never repeatedly detach and reattach the custom domain. One cycle, then poll and wait; GitHub rate-limits certificate orders and can flag the repo for spam.
