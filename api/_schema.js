
export const websiteSchema = {
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
