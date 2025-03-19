export function getDataDir(): string | null {
  switch (Deno.build.os) {
    case "linux": {
      const xdg = Deno.env.get("XDG_DATA_HOME");
      if (xdg) return xdg;

      const home = Deno.env.get("HOME");
      if (home) return `${home}/.local/share`;
      break;
    }

    case "darwin": {
      const home = Deno.env.get("HOME");
      if (home) return `${home}/Library/Application Support`;
      break;
    }

    case "windows":
      return Deno.env.get("APPDATA") ?? null;
  }

  return null;
}

export const placeholderIconData = new TextEncoder().encode(
  `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" fill="white" fill-opacity="0.01"/>
<path d="M41.4004 11.551L36.3332 5H11.6666L6.58398 11.551" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 13C6 11.8954 6.89543 11 8 11H40C41.1046 11 42 11.8954 42 13V40C42 41.6569 40.6569 43 39 43H9C7.34315 43 6 41.6569 6 40V13Z" fill="#2F88FF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
<path d="M32 27L24 35L16 27" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23.9917 19V35" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
);
