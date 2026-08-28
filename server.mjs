import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const publicDir = path.join(process.cwd(), "public");

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Add it to your environment before generating websites.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    businessName: { type: "string" },
    headline: { type: "string" },
    subheadline: { type: "string" },
    description: { type: "string" },
    cta: { type: "string" },
    about: { type: "string" },
    services: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          description: { type: "string" }
        },
        required: ["name", "description"]
      }
    },
    faq: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          answer: { type: "string" }
        },
        required: ["question", "answer"]
      }
    },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" }
  },
  required: [
    "businessName","headline","subheadline","description","cta",
    "about","services","faq","seoTitle","seoDescription"
  ]
};

function json(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(text);
}

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  if (data.length > 100_000) throw new Error("Request too large.");
  return JSON.parse(data || "{}");
}

async function generateWebsite(biz) {
  const prompt = `
You are SiteForge AI, a professional website copywriter and UX strategist.
Create website content for a small business using ONLY the information supplied below.
Do not invent awards, certifications, prices, reviews, statistics, years in business,
guarantees, addresses, or other factual claims that were not supplied.
Write clear, persuasive, concise copy. Keep it suitable for a real public business website.

BUSINESS NAME: ${biz.businessName || "Not provided"}
BUSINESS TYPE: ${biz.businessType || "Not provided"}
DESCRIPTION: ${biz.description || "Not provided"}
PRIMARY CUSTOMER GOAL: ${biz.goal || "Get more customers"}
LOCATION: ${biz.location || "Not provided"}
CONTACT: ${biz.contact || "Not provided"}
DESIGN STYLE: ${biz.style || "Modern"}
BRAND COLORS: ${biz.colors || "Not provided"}

Return a complete homepage content package with 3-6 services and 3-5 useful FAQs.
`;

  const response = await client.responses.create({
    model: MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "siteforge_website",
        strict: true,
        schema
      }
    }
  });

  const raw = response.output_text;
  if (!raw) throw new Error("The AI returned no website content.");
  return JSON.parse(raw);
}


async function editWebsite(website, instruction) {
  const response = await client.responses.create({
    model: MODEL,
    input: `You are SiteForge AI's website editor.
Update the supplied website content according to the user's instruction.
Preserve accurate business facts. Do not invent claims, prices, reviews, certifications,
addresses, awards, or statistics. Return the entire updated website object.

CURRENT WEBSITE:
${JSON.stringify(website)}

USER CHANGE REQUEST:
${instruction}`,
    text: {
      format: {
        type: "json_schema",
        name: "siteforge_website_edit",
        strict: true,
        schema
      }
    }
  });
  if (!response.output_text) throw new Error("The AI returned no updated website.");
  return JSON.parse(response.output_text);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "POST" && url.pathname === "/api/edit") {
      if (!process.env.OPENAI_API_KEY) {
        return json(res, 500, { error: "OPENAI_API_KEY is not configured on the server." });
      }
      const body = await readBody(req);
      if (!body.website || !body.instruction) {
        return json(res, 400, { error: "Website and instruction are required." });
      }
      const website = await editWebsite(body.website, body.instruction);
      return json(res, 200, { website });
    }

    if (req.method === "POST" && url.pathname === "/api/generate") {
      if (!process.env.OPENAI_API_KEY) {
        return json(res, 500, { error: "OPENAI_API_KEY is not configured on the server." });
      }

      const biz = await readBody(req);
      if (!biz.businessName || !biz.description) {
        return json(res, 400, { error: "Business name and description are required." });
      }

      const website = await generateWebsite(biz);
      return json(res, 200, { website });
    }

    if (req.method === "GET") {
      const requested = url.pathname === "/" ? "/index.html" : url.pathname;
      const filePath = path.normalize(path.join(publicDir, requested));
      if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
        return json(res, 404, { error: "Not found" });
      }

      const ext = path.extname(filePath);
      const type = ext === ".html" ? "text/html; charset=utf-8"
        : ext === ".css" ? "text/css; charset=utf-8"
        : ext === ".js" ? "text/javascript; charset=utf-8"
        : "application/octet-stream";

      res.writeHead(200, { "Content-Type": type });
      res.end(await readFile(filePath));
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    json(res, 500, { error: err.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`SiteForge AI running at http://localhost:${PORT}`);
  console.log(`Model: ${MODEL}`);
});
