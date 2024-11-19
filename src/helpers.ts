import type { Precision } from ".";
import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

export const md5 = (content: string): string =>
  createHash("md5").update(content).digest("hex").slice(0, 8);

export function isValidSvg(content: string): boolean {
  return false;
}

export async function getSvgFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? getSvgFiles(res) : res;
    }),
  );
  return Array.prototype
    .concat(...files)
    .filter((file) => file.endsWith(".svg"));
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

export function format(content: string): string {
  const indent = (depth: number) => "\t".repeat(depth); // 动态控制缩进

  const formatTag = (tag: string, depth: number): string => {
    return `${indent(depth)}${tag}\n`;
  };

  const formatBody = (content: string, depth: number): string => {
    // 递归处理内容，遇到标签就增加缩进
    return content
      .replace(
        /<([a-zA-Z0-9]+)([^>]*)>(.*?)<\/\1>/gs,
        (_, tagName, attrs, body) => {
          // 处理标签的开始和结束
          const formattedTag = formatTag(`<${tagName}${attrs}>`, depth);
          const formattedBody = formatBody(body, depth + 1); // 对子内容递归处理
          return (
            formattedTag + formattedBody + formatTag(`</${tagName}>`, depth)
          );
        },
      )
      .replace(/<([a-zA-Z0-9]+)([^>]*)\/>/g, (_, tagName, attrs) => {
        // 处理自闭合标签
        // return formatTag(`<${tagName}${attrs}/>`, depth);
        // 只能这么处理以满足递归调用是找不到闭合标签部分？
        return (
          formatTag(`<${tagName}${attrs}>`, depth) +
          formatTag(`</${tagName}>`, depth)
        );
      });
  };

  // 首先去除原始内容的多余空白字符
  const cleanedBody = content.replace(/\s+/g, " ").trim();

  // 从根部开始格式化
  return formatBody(cleanedBody, 0);
}
