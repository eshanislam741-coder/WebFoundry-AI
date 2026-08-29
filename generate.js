
import OpenAI from "openai";
import { websiteSchema } from "./_schema.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });

  const biz = req.body || {};
  if (!biz.businessName || !biz.description) {
    return res.status(400).json({ error: "Business name and description are required." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

    const prompt = `
You are WebFoundry AI, a professional website copywriter and UX strategist.
Create website content for a small business using ONLY the information supplied below.
Do not invent awards, certifications, prices, reviews, statistics, years in business,
guarantees, addresses, or other factual claims that were not supplied.
Write clear, persuasive, concise copy suitable for a real public business website.

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
      model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "webfoundry_website",
          strict: true,
          schema: websiteSchema
        }
      }
    });

    if (!response.output_text) throw new Error("The AI returned no website content.");
    const website = JSON.parse(response.output_text);
    return res.status(200).json({ website });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Generation failed" });
  }
}
