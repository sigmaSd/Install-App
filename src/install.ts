/**
 * # Install App
 *
 * This module provides utilities for installing applications. It handles
 * creating the necessary directory structure, moving the executable,
 * copying the icon, and creating a .desktop file for Linux systems (or
 * appropriate shortcuts on other OSes).  It also includes functionality for
 * listing and uninstalling installed applications, and initializing a new project.
 *
 * **Usage:**
 *
 * **Installation:**
 *
 * ```bash
 * deno run -A jsr:@sigmasd/install-app install <entrypoint.ts>
 * ```
 *
 * Where `<entrypoint.ts>` is the main entry point of your application that
 * you would normally compile.
 *
 * You can also add this as a task to deno.json which can be more convenient:
 *
 * ```json
 * {
 *   "tasks": {
 *     "install": "deno run -A jsr:@sigmasd/install-app install <entrypoint.ts>"
 *   }
 * }
 * ```
 *
 * **Listing Installed Applications:**
 *
 * ```bash
 * deno run -A jsr:@sigmasd/install-app list
 * ```
 *
 * **Uninstalling an Application:**
 *
 * ```bash
 * deno run -A jsr:@sigmasd/install-app uninstall <app_name>
 * ```
 *
 * Where `<app_name>` is the name of the application as specified in its
 * `install.json` file.
 *
 * **Initializing a new project:**
 *
 * ```bash
 * deno run -A jsr:@sigmasd/install-app init <app_name>
 * ```
 *
 *  Where `<app_name>` is desired name for your application.  This command will:
 *   1. Create an `assets` directory in the current working directory.
 *   2. Create a default `install.json` file inside the `assets` directory,
 *      pre-populated with the provided `<app_name>`.
 *   3. Create a placeholder `icon.svg` file inside the `assets` directory.
 *   4. Print instructions for next steps (creating your application's entrypoint, customizing the icon and install.json, and running the install command).
 *
 * **Project Structure:**
 *
 * Your project should have the following structure:
 *
 * ```
 * my-app/
 * ├── assets/
 * │   ├── install.json  (Installation metadata)
 * │   └── <icon_name>.svg (Your application's icon, referenced in install.json)
 * ├── src/
 * │   └── <entrypoint>.ts  (Your application's main entry point)
 * └── ... other files ...
 * ```
 *
 * **`install.json` Format:**
 *
 * Create a file named `install.json` within the `assets` directory. This file
 * contains metadata about your application:
 *
 * ```jsonc
 * {
 *   "name": "<app_name>",         // The name of your application (used for the executable and shortcut)
 *   "version": "<version_string>", // The version of your application (informational)
 *   "description": "<description>", // A short description of your application (informational)
 *   "icon": "<icon_name>.svg"   // The filename of your application's icon (within the assets directory)
 * }
 * ```
 *
 *  *   **`name`:**  The name of your application.  This will be the name of
 *      the executable and the desktop shortcut/alias.  *It should be a valid
 *      filename (no spaces or special characters).*
 *  *   **`version`:**  The version of your application (e.g., "1.0.0").
 *  *   **`description`:** A short description of your application.
 *  *   **`icon`:** The filename of your application's icon file (e.g.,
 *      "my-app-icon.svg").  This file *must* be located in the `assets`
 *      directory.
 *
 * **Installation Process:**
 *
 * 1.  **Compilation:** The script first compiles your application using
 *     `deno compile`. The output executable is named according to the `name`
 *     field in `install.json`.
 * 2.  **Directory Creation:** A directory named `deno-installed-apps` is created
 *     within the user's data directory (e.g., `%APPDATA%\deno-installed-apps` on
 *     Windows, `~/.local/share/deno-installed-apps` on Linux,
 *     `~/Library/Application Support/deno-installed-apps` on macOS).  An
 *     `applications` directory is also created within the user's data
 *     directory, if it doesn't already exist.
 * 3.  **File Copying:**
 *     *   The compiled executable is moved to the `deno-installed-apps/<name>` directory.
 *     *   The application icon is copied to the `deno-installed-apps/<name>` directory.
 * 4.  **Shortcut Creation:**
 *     *   **Linux:** A `.desktop` file is created in the `applications`
 *         directory, allowing the application to appear in application
 *         launchers.
 *     *   **Other OSes:** A warning is printed that shortcut creation is not
 *         yet implemented.
 *
 * **Example:**
 *
 * If your application's entry point is `src/my_app.ts` and your `install.json`
 * contains:
 *
 * ```json
 * {
 *   "name": "my-app",
 *   "version": "1.0.0",
 *   "description": "My awesome app",
 *   "icon": "icon.svg"
 * }
 * ```
 *
 * You would install it with:
 *
 * ```bash
 * deno run -A jsr:@sigmasd/install-app install src/my_app.ts
 * ```
 *
 * This will create an executable named `my-app`, copy the icon, and create
 * a desktop shortcut/alias named `my-app`.
 *
 * @module
 */

import { dirname, join } from "jsr:@std/path@^1.0.8";
import { ensureDirSync, existsSync } from "jsr:@std/fs@1";
import { assert } from "jsr:@std/assert@^1/assert";
import { getDataDir, placeholderIconData } from "./utils.ts";

interface InstallMetadata {
  name: string;
  version: string;
  description: string;
  icon: string;
}

const BASE_INSTALL_DIR_NAME = "deno-installed-apps";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function installApp(
  { binName, metadata, appDir }: {
    binName: string;
    metadata: InstallMetadata;
    appDir: string;
  },
) {
  const dataDir = getDataDir();
  assert(dataDir, "Could not determine user data directory.");
  const appsPath = join(dataDir, BASE_INSTALL_DIR_NAME);
  const hostBinDirPath = join(appsPath, binName);
  ensureDirSync(hostBinDirPath);

  // 1. Install App
  Deno.renameSync(binName, join(hostBinDirPath, binName));
  // 2. Install Icon
  Deno.copyFileSync(
    join(appDir, "assets", metadata.icon),
    join(hostBinDirPath, metadata.icon),
  );
  // 3. Install Metadata by creating a linux desktop file
  const applicationsDir = join(dataDir, "applications");
  ensureDirSync(applicationsDir); // Ensure applications directory exists.
  Deno.writeTextFileSync(
    join(applicationsDir, `${binName}.desktop`),
    `
[Desktop Entry]
Name=${metadata.name}
Exec=${join(hostBinDirPath, binName)}
Icon=${join(hostBinDirPath, metadata.icon)}
Type=Application
Categories=Utility;
`,
  );

  console.log(`Application "${metadata.name}" installed successfully.`);
}

async function compileApp(
  { appEntryPoint: app, outputPath }: {
    appEntryPoint: string;
    outputPath: string;
  },
) {
  const result = await new Deno.Command("deno", {
    args: [
      "compile",
      "--allow-all",
      "--no-check",
      "--output",
      outputPath,
      app,
    ],
  }).spawn().status;

  if (!result.success) {
    console.error("Compilation failed:");
    Deno.exit(1);
  }
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

function listApps() {
  const dataDir = getDataDir();
  assert(dataDir, "Could not determine user data directory.");
  const appsPath = join(dataDir, BASE_INSTALL_DIR_NAME);

  if (!existsSync(appsPath)) {
    console.log("No applications installed.");
    return;
  }

  try {
    const apps = [];
    for (const dirEntry of Deno.readDirSync(appsPath)) {
      if (dirEntry.isDirectory) {
        const appName = dirEntry.name;
        const desktopFilePath = join(
          dataDir,
          "applications",
          `${appName}.desktop`,
        );
        const originalName = Deno.readTextFileSync(desktopFilePath)
          .match(/Name=(.*)/)?.at(1)?.trim();
        if (originalName) {
          apps.push(originalName);
        } else {
          console.error("Could not read orignal name of", appName);
        }
      }
    }
    if (apps.length === 0) {
      console.log("No applications installed.");
      return;
    }
    console.log("Installed applications:");
    for (const appName of apps) {
      console.log(`- ${appName}`);
    }
  } catch (error) {
    console.error("Error listing applications:", error);
  }
}

function uninstallApp(appName: string) {
  const dataDir = getDataDir();
  assert(dataDir, "Could not determine user data directory.");
  const appPath = join(dataDir, BASE_INSTALL_DIR_NAME, appName);
  const desktopFilePath = join(
    dataDir,
    "applications",
    `${appName}.desktop`,
  );

  if (!existsSync(appPath)) {
    console.log(`Application "${appName}" is not installed.`);
    return;
  }

  try {
    Deno.removeSync(appPath, { recursive: true });
    if (existsSync(desktopFilePath)) {
      Deno.removeSync(desktopFilePath);
    }
    console.log(`Application "${appName}" uninstalled successfully.`);
  } catch (error) {
    console.error(`Error uninstalling application "${appName}":`, error);
  }
}

function initApp(appName: string) {
  const assetsDir = join(Deno.cwd(), "assets");
  ensureDirSync(assetsDir);

  const installJsonPath = join(assetsDir, "install.json");
  const iconPath = join(assetsDir, "icon.svg");

  const defaultInstallJson = {
    name: appName,
    version: "0.1.0",
    description: "My awesome Deno application",
    icon: "icon.svg",
  };

  Deno.writeTextFileSync(
    installJsonPath,
    JSON.stringify(defaultInstallJson, null, 2),
  );

  // Create a simple placeholder icon.
  Deno.writeFileSync(iconPath, placeholderIconData);

  console.log(`Initialized project for "${appName}".`);
  console.log(`Created directory: ${assetsDir}`);
  console.log(`Created file: ${installJsonPath}`);
  console.log(`Created file: ${iconPath}`);
  console.log("\nNext steps:");
  console.log("1. Create your application entrypoint (e.g., src/main.ts).");
  console.log("2. Customize assets/install.json with your app's details.");
  console.log("3. Replace assets/icon.svg with your application's icon.");
  console.log(
    `4. Run 'deno run -A jsr:@sigmasd/install-app install <entrypoint.ts>' to install.`,
  );
}

if (import.meta.main) {
  if (Deno.build.os !== "linux") {
    console.log("Unsupported OS, feel free to open a PR");
    Deno.exit(1);
  }

  const command = Deno.args[0];

  switch (command) {
    case "install": {
      const appEntryPoint = Deno.args[1];
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
      const binName = sanitizeFileName(metadata.name);
      await compileApp({ appEntryPoint, outputPath: binName });
      installApp({ binName, metadata, appDir });
      break;
    }
    case "list":
      listApps();
      break;
    case "uninstall": {
      const appName = Deno.args[1];
      if (!appName) {
        console.error("Please provide the name of the app to uninstall.");
        Deno.exit(1);
      }
      uninstallApp(sanitizeFileName(appName));
      break;
    }
    case "init": {
      const appName = Deno.args[1];
      if (!appName) {
        console.error("Please provide a name for your application.");
        Deno.exit(1);
      }
      initApp(appName);
      break;
    }
    default:
      console.log(
        "Usage: deno run -A jsr:@sigmasd/install-app <command> [args]",
      );
      console.log("Commands:");
      console.log("  init <app_name>          Initialize a new project");
      console.log("  install <entrypoint.ts>  Install an application");
      console.log("  list                     List installed applications");
      console.log("  uninstall <app_name>     Uninstall an application");
      Deno.exit(1);
  }
}
