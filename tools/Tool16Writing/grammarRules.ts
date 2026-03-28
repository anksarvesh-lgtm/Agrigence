export function normalize(text: string): string {
  return text
    .replace(/\bgot\b/gi, "obtained")
    .replace(/\ba lot of\b/gi, "substantial")
    .replace(/\bshowed\b/gi, "demonstrated")
    .replace(/\bbig\b/gi, "significant")
    .replace(/\bvery\b/gi, "highly")
    .replace(/\blooked at\b/gi, "examined")
    .replace(/\bfound out\b/gi, "determined")
    .replace(/\bmade sure\b/gi, "ensured");
}
