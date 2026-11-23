export const site = {
  name: "Leonida API",
  tagline: "The open GTA VI database & REST API",
  description:
    "Free, open-source, Zod-validated data and a fast REST API for Grand Theft Auto VI — vehicles, locations, characters, weapons, radio and more across Leonida.",
  repo: "https://github.com/jubyuhanna-create/gta-vi",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
};
