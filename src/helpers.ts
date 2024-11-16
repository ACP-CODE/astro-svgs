import type { Precision } from ".";
import { createHash } from "crypto";

export const md5 = (content: string): string =>
  createHash("md5").update(content).digest("hex").slice(0, 8);

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

export function format(content: string): string {
  return content
    .replace(/(<defs>|<\/defs>)/g, "\n\t$1")
    .replace(/(<symbol[^>]*>|<\/symbol>)/g, "\n\t\t$1")
    .replace(/(<path[^>]*>|<polygon[^>]*>|<ellipse[^>]*>)/g, "\n\t\t\t$1")
    .replace(/(<path[^>]*>|<polygon[^>]*>|<ellipse[^>]*>)/g, (match) =>
      match.replace(/\s+/g, " ").replace("\n", " "),
    )
    .replace(/(<\/svg>)/g, "\n$1")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}
