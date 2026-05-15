const DEFAULT_MODEL = '@cf/meta/llama-3.2-1b-instruct';
const MAX_MESSAGE_LENGTH = 600;
const MAX_HISTORY_ITEMS = 6;

const PROFILE_CONTEXT = `
PUBLIC PROFILE CONTEXT FOR ZURIEL SHANLEY TANYORY
Use only this context when answering. Do not invent facts. Do not reveal or infer private contact details. The public email is zurielst@u.nus.edu. Mobile number is intentionally excluded.

Positioning:
Zuriel Shanley Tanyory is an Information Security student at the National University of Singapore, a cybersecurity consultant intern, founder, SOC builder, secure software developer, and cybersecurity community contributor. Public profile links: GitHub https://github.com/Leiruz, LinkedIn https://linkedin.com/in/zuriel-shanley/, website https://zurielst.com.

Education:
- National University of Singapore, Bachelor of Computing in Information Security, Aug 2024 - May 2028.
- Ngee Ann Polytechnic, Diploma in Cybersecurity & Digital Forensics, Apr 2019 - May 2022, CGPA 3.8217/4, certification in Advanced Computing Mathematics.

Experience:
- SingTel, Cybersecurity Consultant Intern, Singapore, May 2026 - Aug 2026. Developed Python automation integrating Akamai WAF APIs to extract security risk alerts, logs, and network traffic data, transforming raw events into structured reports with documentation and diagrams to improve threat visibility, operations monitoring, and reporting efficiency for analysts.
- CiTaDel Cybersecurity Solutions, Founder, Singapore, Mar 2023 - May 2026. Founded CiTaDel to make cybersecurity affordable for SMEs and consumers using open-source solutions. Led SOC direction with EDR and SOAR. Resume metrics: SOC solution cost reduction down by 80%, threat detection increased by up to 90%, false positives reduced by 20% through deep learning AI models in SOC workflows.
- Singapore Armed Forces, Full-Stack Web Developer, Singapore, Jan 2023 - Mar 2023. Led a four-person team building a 3-tier full-stack web application to digitize paper-based military processes. Used HTML, CSS, JavaScript, PHP, Bootstrap, and MySQL. Resulted in improved data accuracy, shorter processing time, less paper waste, and efficiency/cost improvements up to 20%.
- NCS Pte Ltd, Cybersecurity Consultant Intern, Singapore, Aug 2021 - Feb 2022. Coordinated EDR installation, configuration, integration, upgrading, and troubleshooting for government-managed endpoints, contributing to a 40% increase in threat detection and early mitigation. Troubleshot critical security tools and helped ensure 99.9% uptime. Earned CyberArk and Carbon Black certifications. Recognized as a Subject Matter Expert in Carbon Black Endpoint Detection and Response.

Projects:
- Akamai WAF Automation, May 2026 - Aug 2026, security reporting at SingTel. Automated WAF alert, log, and traffic extraction into analyst-ready reporting.
- CiTaDel SOC, Mar 2023 - May 2026. Founder-led SOC direction using open-source cybersecurity, EDR, SOAR, AI-assisted workflows, and security automation. Public site: https://citadel.zurielst.com/.
- SAF Digitization App, Jan 2023 - Mar 2023. Internal/non-public 3-tier web application for digitizing military paper workflows.
- Cinderella Shoes, Secure Full Stack Web App, Team Leader, Oct 2020 - Mar 2021. 3-tier ASP.NET secure software development assignment with Stripe payment gateway and reCAPTCHA, reported 0% transaction failure through payment. GitHub: https://github.com/Leiruz/Project-Cinderella.
- Ngee Ann Badminton Webpage, Member, Apr 2019 - Oct 2019. Static front-end website for Ngee Ann Badminton CCA using Bootstrap, wow.js, HTML, CSS, and JavaScript. Public website: https://ngeeannbadminton.zurielst.com/index.html.
- Project Xynthea / Hash Encryption, Member, Jan 2018 - May 2018. Python three-factor authentication system using Twilio OTP, MD5, and SHA-256. No verified public repository listed in the resume.

Skills:
Ethical hacking, secure web development, ASP.NET, malware analysis tools and techniques, Cisco Packet Tracer, switching, Palo Alto NGFW, FortiGate Firewall, CentOS and RedHat Linux hardening, RNN, CNN, NLP, object-oriented and functional programming, OWASP Top 10, Zed Attack Proxy, Burp Suite, Ghidra, IDA, and EnCase.

Selected certifications and awards:
Cisco Cyber Threat Management Certificate. Fortinet Certified Associate in Cybersecurity, 20 Oct 2023 - 20 Oct 2025. FortiGate 7.4 Operator Self-Paced Course. SingTel Cyber Security Cadet Scholarship, 2021 - 2022. CyberArk Certified Trustee, 2021. CyberArk Introduction to Privileged Access Management, 2021. VMware Carbon Black Cloud Fundamentals Certification, 2021. NUS Business School Zero To One Entrepreneurship Program, 2021. Cyber Defender Discovery Camp 2020: Gold in Basic Reverse Engineering; Silver in Using Metasploit, Open Source Intelligence, and Web Vulnerabilities; Bronze in Getting Started with Kali Linux; completion in Machine Learning in Cybersecurity. MINDEF Bug Bounty Programme 2019. Edusave Good Progress Award 2022. Cyber Youth Singapore EAE Hackathon 2020 Certificate of Appreciation.

Publications:
- Food Image Classification Using Convolutional Neural Network with LSTM and GRU, resume-provided link: https://bit.ly/DeepLearning2020.
- Emoji Prediction and Autocorrect Using Recurrent Neural Network, resume-provided link: https://bit.ly/DeepLearning2020.

Leadership and community:
- Homeless Hearts of Singapore, Member, Jun 2021 - Dec 2022. Befriended and distributed food and basic necessities to people in need, including homeless individuals and people affected by Covid-19 travel restrictions.
- Genesis, Vice-President of Startup, Apr 2019 - May 2021. Helped spearhead founding of CiTaDel and was nominated for the Zero to One Entrepreneurship Program with Meet Ventures and NUS Business School.
- NullSec, Head of Publicity, Apr 2019 - May 2021. Active cybersecurity community participant at Ngee Ann Polytechnic. Helped organize inter-poly CTF Lag n Crash, YCEP CTF, and annual Hack'n'Flag CTF. Completed Cyber Defender Discovery Camp with six certifications, received recognition for Machine Learning in Cybersecurity, and attained 41st out of 237 teams in a CTF competition.
`;

function getModel(env) {
  const candidate = typeof env.MODEL === 'string' ? env.MODEL.trim() : '';
  return candidate.startsWith('@cf/') ? candidate : DEFAULT_MODEL;
}

const DEFAULT_ALLOWED_ORIGINS = [
  'https://zurielst.com',
  'https://www.zurielst.com',
  'https://leiruz.github.io',
  'null'
];

function normalizeOrigin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw === '*' || raw === 'null') return raw;
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, '');
  }
}

function allowedOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || '');
  const configured = raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured])];
}

function corsHeaders(request, env) {
  const requestOrigin = normalizeOrigin(request.headers.get('Origin') || '');
  const allowed = allowedOrigins(env);
  const allowAll = allowed.includes('*');
  const isAllowed = allowAll || !requestOrigin || allowed.includes(requestOrigin);

  // If the request comes from Zuriel's portfolio, reflect that exact origin.
  // This avoids the common mismatch caused by trailing slashes in ALLOWED_ORIGIN.
  const allowOrigin = allowAll ? '*' : isAllowed ? (requestOrigin || 'https://zurielst.com') : 'https://zurielst.com';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}
function json(data, status, request, env) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders(request, env),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function clean(value, maxLength = MAX_MESSAGE_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({ role: item.role, content: clean(item.content, 800) }));
}

function extractAnswer(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (typeof result.response === 'string') return result.response;
  if (typeof result.text === 'string') return result.text;
  if (typeof result.answer === 'string') return result.answer;
  if (result.result && typeof result.result.response === 'string') return result.result.response;
  if (Array.isArray(result.choices) && result.choices[0]?.message?.content) return result.choices[0].message.content;
  return '';
}


function normalizeWorkerPath(pathname) {
  let path = String(pathname || '').replace(/\/+$/, '') || '/';
  // Support three deployment modes without changing the front end:
  // 1) workers.dev custom URL: /chat
  // 2) same-origin Cloudflare route: zurielst.com/ai/chat
  // 3) optional API route: zurielst.com/api/ai/chat
  if (path === '/ai' || path === '/api/ai') return '/';
  if (path.startsWith('/ai/')) path = path.slice(3) || '/';
  if (path.startsWith('/api/ai/')) path = path.slice(7) || '/';
  return path || '/';
}

function routeKind(path) {
  const cleanPath = normalizeWorkerPath(path);
  if (cleanPath === '/' || cleanPath === '/info') return 'root';
  if (cleanPath === '/health') return 'health';
  if (cleanPath === '/cors-check') return 'cors-check';
  if (cleanPath === '/test') return 'test';
  if (cleanPath === '/chat') return 'chat';
  return 'not-found';
}

async function runAssistant(env, message, history = []) {
  if (!env.AI || typeof env.AI.run !== 'function') {
    throw new Error('Workers AI binding is missing. Add a Workers AI binding named exactly AI.');
  }

  const system = `You are Zuriel Shanley Tanyory's AI resume assistant on his public cybersecurity portfolio website. Answer clearly, concisely, and professionally for recruiters and hiring managers. Use only the verified profile context below. Do not invent companies, dates, metrics, awards, links, certifications, publications, or private details. Do not mention a mobile number. If the context does not contain the answer, say that the information is not available from the verified resume context. Keep answers concise.\n\n${PROFILE_CONTEXT}`;

  const messages = [
    { role: 'system', content: system },
    ...normalizeHistory(history),
    { role: 'user', content: message }
  ];

  const model = getModel(env);
  const result = await env.AI.run(model, {
    messages,
    max_tokens: 420,
    temperature: 0.2
  });

  const answer = extractAnswer(result).trim();
  return {
    answer: answer || 'I could not generate a resume-backed answer for that question.',
    model
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = normalizeWorkerPath(url.pathname);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method === 'GET' && path === '/') {
      return json({ ok: true, service: 'Zuriel AI Resume Assistant', endpoint: '/ai/chat', usage: 'GET /ai/chat?message=... or POST /ai/chat. Direct /chat and /api/ai/chat also work.', health: '/ai/health', test: '/ai/test' }, 200, request, env);
    }

    if (request.method === 'GET' && path === '/health') {
      return json({
        ok: true,
        hasAI: Boolean(env.AI),
        model: getModel(env),
        allowedOriginsConfigured: Boolean(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN),
        defaultPortfolioOriginAllowed: true
      }, 200, request, env);
    }

    if (request.method === 'GET' && path === '/cors-check') {
      return json({
        ok: true,
        requestOrigin: request.headers.get('Origin') || null,
        allowedOrigins: allowedOrigins(env),
        cors: corsHeaders(request, env)
      }, 200, request, env);
    }

    if (request.method === 'GET' && path === '/test') {
      try {
        const result = await runAssistant(env, 'Give a one-sentence summary of Zuriel for a cybersecurity recruiter.', []);
        return json({ ok: true, ...result }, 200, request, env);
      } catch (error) {
        return json({ ok: false, error: error?.message || String(error), model: getModel(env) }, 500, request, env);
      }
    }

    if (path !== '/chat') {
      return json({ error: 'Route not found. Use GET or POST /ai/chat. Direct /chat and /api/ai/chat also work.' }, 404, request, env);
    }

    let message = '';
    let history = [];

    if (request.method === 'GET') {
      // GET support is intentional: it avoids browser JSON POST preflight problems
      // for this small public resume assistant. The question is limited to 600 chars.
      message = clean(url.searchParams.get('message') || url.searchParams.get('q') || url.searchParams.get('question') || '');
    } else if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body.' }, 400, request, env);
      }

      message = clean(body.message || body.question || body.prompt || body.input || '');
      history = Array.isArray(body.history) ? body.history : [];
    } else {
      return json({ error: 'Use GET /ai/chat?message=... or POST /ai/chat with JSON. Direct /chat and /api/ai/chat also work.' }, 405, request, env);
    }

    if (!message) {
      return json({ error: 'Please provide a message.' }, 400, request, env);
    }

    try {
      const result = await runAssistant(env, message, history);
      return json(result, 200, request, env);
    } catch (error) {
      return json({ error: error?.message || 'Workers AI could not complete the request.', model: getModel(env) }, 500, request, env);
    }
  }
};
