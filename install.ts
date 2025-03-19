import { dirname, join } from "jsr:@std/path@^1.0.8";
import { ensureDirSync } from "jsr:@std/fs@1";
import { assert } from "jsr:@std/assert@^1/assert";
import { getDataDir } from "./utils.ts";

interface InstallMetadata {
  name: string;
  version: string;
  description: string;
  icon: string;
}

function installApp(
  { metadata, appDir }: { metadata: InstallMetadata; appDir: string },
) {
  const dataDir = getDataDir();
  assert(dataDir);
  const appsPath = join(dataDir, "deno-install-apps");
  ensureDirSync(appsPath);

  // 1. Install App
  Deno.renameSync(metadata.name, join(appsPath, metadata.name));
  // 2. Install Icon
  Deno.copyFileSync(
    join(appDir, "assets", metadata.icon),
    join(appsPath, metadata.icon),
  );
  // 3. Install Metadata by creating a linux desktop file
  Deno.writeTextFileSync(
    join(dataDir, "applications", `${metadata.name}.desktop`),
    `
[Desktop Entry]
Name=${metadata.name}
Exec=${join(appsPath, metadata.name)}
Icon=${join(appsPath, metadata.icon)}
Type=Application
Categories=Utility;
`,
  );
}

async function compileApp(
  { appEntryPoint: app, metadata }: {
    appEntryPoint: string;
    metadata: InstallMetadata;
  },
) {
  await new Deno.Command("deno", {
    args: [
      "compile",
      "--allow-all",
      "--no-check",
      "--output",
      metadata.name,
      app,
    ],
  }).spawn().status;
}

if (import.meta.main) {
  if (Deno.build.os !== "linux") {
    console.log("Unsupported OS, feel free to open a PR");
    Deno.exit(1);
  }

  const appEntryPoint = Deno.args[0];
  if (!appEntryPoint) {
    console.log("Please provide the app path");
    Deno.exit(1);
  }
  const appDir = dirname(appEntryPoint);

  const metadata = readMetaData({ appDir });
  if (!metadata) {
    console.log("Could not find install.json");
    Deno.exit(1);
  }
  await compileApp({ appEntryPoint, metadata });
  installApp({ metadata, appDir });
}

function readMetaData(
  { appDir }: { appDir: string },
): InstallMetadata | undefined {
  const metadataPath = join(appDir, "assets", "install.json");
  try {
    return JSON.parse(Deno.readTextFileSync(metadataPath));
  } catch (error) {
    console.error("Error reading metadata:", error);
    return undefined;
  }
}
