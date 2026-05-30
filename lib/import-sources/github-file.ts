export interface GitHubFileSource {
  owner: string;
  repo: string;
  ref: string;
  path: string;
  filename: string;
  rawUrl: string;
  htmlUrl: string;
}

function decodeSegments(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function hasSupportedExtension(filePath: string) {
  const lower = filePath.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".markdown");
}

function encodePathSegments(value: string) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function parseGitHubFileUrl(input: string): GitHubFileSource {
  const url = new URL(input.trim());
  const host = url.hostname.toLowerCase();

  if (host !== "github.com" && host !== "raw.githubusercontent.com") {
    throw new Error("只支持 GitHub 公共文件 URL");
  }

  const segments = decodeSegments(url.pathname);
  let owner = "";
  let repo = "";
  let ref = "";
  let filePath = "";

  if (host === "github.com") {
    if (segments.length < 5 || segments[2] !== "blob") {
      throw new Error("GitHub URL 需要指向具体 blob 文件");
    }

    [owner, repo, , ref] = segments;
    filePath = segments.slice(4).join("/");
  } else {
    if (segments.length < 4) {
      throw new Error("Raw GitHub URL 需要指向具体文件");
    }

    [owner, repo, ref] = segments;
    filePath = segments.slice(3).join("/");
  }

  if (!owner || !repo || !ref || !filePath) {
    throw new Error("GitHub 文件 URL 缺少 owner、repo、ref 或 path");
  }

  if (!hasSupportedExtension(filePath)) {
    throw new Error("只支持导入公开 GitHub Markdown 文件（.md 或 .markdown）");
  }

  const encodedRef = encodeURIComponent(ref);
  const encodedPath = encodePathSegments(filePath);

  return {
    owner,
    repo,
    ref,
    path: filePath,
    filename: filePath.split("/").at(-1) ?? filePath,
    rawUrl: `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodedRef}/${encodedPath}`,
    htmlUrl: `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/blob/${encodedRef}/${encodedPath}`,
  };
}
