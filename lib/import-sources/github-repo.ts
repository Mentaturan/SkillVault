export interface GitHubRepoSource {
  owner: string;
  repo: string;
  ref: string;
  archiveUrl: string;
  htmlUrl: string;
}

function decodeSegments(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

export function parseGitHubRepoUrl(input: string, refOverride?: string): GitHubRepoSource {
  const url = new URL(input.trim());
  const host = url.hostname.toLowerCase();

  if (host !== "github.com") {
    throw new Error("只支持 GitHub 公共仓库 URL");
  }

  const segments = decodeSegments(url.pathname);

  if (segments.length < 2) {
    throw new Error("GitHub 仓库 URL 需要包含 owner/repo");
  }

  const owner = segments[0];
  const repo = segments[1];

  let ref = refOverride?.trim() || "main";

  if (segments.length >= 4 && segments[2] === "tree") {
    ref = segments.slice(3).join("/");
  }

  if (!owner || !repo) {
    throw new Error("GitHub 仓库 URL 缺少 owner 或 repo");
  }

  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const encodedRef = encodeURIComponent(ref);

  return {
    owner,
    repo,
    ref,
    archiveUrl: `https://api.github.com/repos/${encodedOwner}/${encodedRepo}/zipball/${encodedRef}`,
    htmlUrl: `https://github.com/${encodedOwner}/${encodedRepo}/tree/${encodedRef}`,
  };
}
