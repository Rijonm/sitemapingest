import type { TreeNode } from "@/types";

export function buildTree(urls: string[]): TreeNode {
  const root: TreeNode = { name: "/", children: new Map(), isPage: false };

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname
        .split("/")
        .filter(Boolean);

      let current = root;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (!current.children.has(seg)) {
          current.children.set(seg, {
            name: seg,
            children: new Map(),
            isPage: false,
          });
        }
        current = current.children.get(seg)!;
      }
      current.isPage = true;
    } catch {
      // Skip malformed URLs
    }
  }

  return root;
}

export function renderTree(node: TreeNode, prefix: string = "", isLast: boolean = true): string {
  const lines: string[] = [];

  if (prefix === "") {
    // Root node
    lines.push(node.name);
  } else {
    const connector = isLast ? "└── " : "├── ";
    lines.push(prefix + connector + node.name);
  }

  const children = Array.from(node.children.values());
  children.forEach((child, i) => {
    const childIsLast = i === children.length - 1;
    const childPrefix = prefix === "" ? "" : prefix + (isLast ? "    " : "│   ");
    lines.push(renderTree(child, childPrefix, childIsLast));
  });

  return lines.join("\n");
}
