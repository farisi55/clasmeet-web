const ALLOWED_ORIGINS = new Set([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8788",
  "https://your-frontend-domain.com",
  "https://classmateid.farisi55.workers.dev"
]);

const FIELD_RULES = {
  nama: { label: "Nama", max: 120, required: "Nama wajib diisi" },
  kota: { label: "Kota", max: 120, required: "Kota wajib diisi" },
  kontak: { label: "Email atau WhatsApp", max: 160, required: "Email atau WhatsApp wajib diisi" },
  pesan: { label: "Pesan", max: 1000, required: "Pesan wajib diisi" }
};

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    if (url.pathname !== "/classmate/v1/kontak/submit") {
      return jsonResponse(
        { success: false, message: "Not found" },
        404,
        corsHeaders
      );
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { success: false, message: "Method not allowed" },
        405,
        { ...corsHeaders, Allow: "POST, OPTIONS" }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return jsonResponse(
        { success: false, message: "Invalid JSON" },
        400,
        corsHeaders
      );
    }

    const { values, errors } = validateAndSanitize(body);

    if (Object.keys(errors).length > 0) {
      return jsonResponse(
        { success: false, message: "Validation error", errors },
        400,
        corsHeaders
      );
    }

    if (!env.DB_KONTAK) {
      return jsonResponse(
        { success: false, message: "Database binding is not configured" },
        500,
        corsHeaders
      );
    }

    const userAgent = sanitizeText(request.headers.get("User-Agent") || "", 300);
    const ipAddress = sanitizeText(
      request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For")?.split(",")[0] ||
        "",
      80
    );

    try {
      const result = await env.DB_KONTAK.prepare(
        `INSERT INTO classmate_kontak
          (nama, kota, kontak, pesan, source_kontak, user_agent, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          values.nama,
          values.kota,
          values.kontak,
          values.pesan,
          "web",
          userAgent,
          ipAddress
        )
        .run();

      return jsonResponse(
        {
          success: true,
          message: "Data kontak berhasil dikirim",
          data: {
            id: result?.meta?.last_row_id || null
          }
        },
        200,
        corsHeaders
      );
    } catch (error) {
      return jsonResponse(
        { success: false, message: "Database error" },
        500,
        corsHeaders
      );
    }
  }
};

function validateAndSanitize(body) {
  const values = {};
  const errors = {};

  for (const [field, rule] of Object.entries(FIELD_RULES)) {
    const rawValue = typeof body?.[field] === "string" ? body[field] : "";
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) {
      errors[field] = rule.required;
      continue;
    }

    if (containsScriptTag(trimmedValue)) {
      errors[field] = `${rule.label} tidak boleh berisi tag script`;
      continue;
    }

    if (trimmedValue.length > rule.max) {
      errors[field] = `${rule.label} maksimal ${rule.max} karakter`;
      continue;
    }

    values[field] = sanitizeText(trimmedValue, rule.max);
  }

  return { values, errors };
}

function sanitizeText(value, maxLength) {
  return String(value)
    .trim()
    .slice(0, maxLength)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[&<>"'`]/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;"
      };
      return entities[char];
    });
}

function containsScriptTag(value) {
  return /<\s*\/?\s*script\b/i.test(value);
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");

  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}