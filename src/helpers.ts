import type { Precision } from ".";
import { createHash } from "crypto";

export function md5(content: string): string {
  return createHash("md5").update(content).digest("hex").slice(0, 8);
}

export function minify(content: string, level: Precision): string {
  content = content.replace(/\s{2,}/g, " ");

  if (level === "low") {
    return content;
  }

  content = content.replace(/\n/g, "");
  if (level === "medium") {
    return content;
  }

  content = content
    .replace(/>\s+</g, "><")
    .replace(/<!--.*?-->/g, "")
    .replace(/"/g, "'");

  return content;
}

export function beautify(content: string): string {
  return content.replace(/></g, ">\n<");
}
