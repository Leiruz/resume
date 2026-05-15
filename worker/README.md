# Zuriel AI Resume Assistant Worker

This Worker powers the AI Resume Assistant. It can run from the original workers.dev URL or from a same-origin Cloudflare route under `zurielst.com/api/ai*`.

## Required binding

Add a Workers AI binding named exactly:

```text
AI
```

## Recommended route for the live portfolio

Because the live site has a Content Security Policy that only allows `connect-src 'self'`, route the Worker through the same domain:

```text
zurielst.com/api/ai*
```

Optional if you use www:

```text
www.zurielst.com/api/ai*
```

The portfolio frontend calls:

```text
/api/ai
```

Test after deployment:

```text
https://zurielst.com/api/ai/health
https://zurielst.com/api/ai?message=What%20SOC%20and%20EDR%20experience%20does%20Zuriel%20have
```
