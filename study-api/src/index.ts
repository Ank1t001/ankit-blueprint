export interface Env {
  PROGRESS_KV: KVNamespace;
  ALLOWED_ORIGIN: string;
}

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isValidStage(s: string) {
  return /^stage[1-4]$/i.test(s);
}
function isValidWeek(w: string) {
  return /^week\d+$/i.test(w);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(env.ALLOWED_ORIGIN) });
    }

    // Health
    if (url.pathname === "/health") {
      return new Response("ok", { status: 200, headers: cors(env.ALLOWED_ORIGIN) });
    }

    // GET /progress?stage=stage1&week=week1
    if (url.pathname === "/progress" && request.method === "GET") {
      const stage = url.searchParams.get("stage") || "";
      const week = url.searchParams.get("week") || "";

      if (!isValidStage(stage) || !isValidWeek(week)) {
        return new Response(JSON.stringify({ error: "Invalid stage/week" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
        });
      }

      const key = `public:${stage}:${week}`;
      const val = await env.PROGRESS_KV.get(key);

      return new Response(val || "{}", {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
      });
    }

    // POST /progress  { stage, week, data }
    if (url.pathname === "/progress" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
        });
      }

      const stage = String(body.stage || "");
      const week = String(body.week || "");
      const data = body.data ?? {};

      if (!isValidStage(stage) || !isValidWeek(week)) {
        return new Response(JSON.stringify({ error: "Invalid stage/week" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
        });
      }

      const raw = JSON.stringify(data);
      if (raw.length > 200_000) {
        return new Response(JSON.stringify({ error: "Payload too large" }), {
          status: 413,
          headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
        });
      }

      const key = `public:${stage}:${week}`;
      await env.PROGRESS_KV.put(key, raw);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors(env.ALLOWED_ORIGIN) },
      });
    }

    return new Response("Not Found", { status: 404, headers: cors(env.ALLOWED_ORIGIN) });
  },
};