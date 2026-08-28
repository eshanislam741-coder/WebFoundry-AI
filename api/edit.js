
import OpenAI from "openai";
import { websiteSchema } from "./_schema.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is not configured." });

  const { website, instruction } = req.body || {};
  if (!website || !instruction) {
    return res.status(400).json({ error: "Website and instruction are required." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

    const response = await client.responses.create({
      model,
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
          schema: websiteSchema
        }
      }
    });

    if (!response.output_text) throw new Error("The AI returned no updated website.");
    return res.status(200).json({ website: JSON.parse(response.output_text) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Edit failed" });
  }
}
