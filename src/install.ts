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
 * deno run -A jsr:@sigmasd/install-app install <executable>
 * ```
 *
 * Where `<executable>` is the compiled executable of your application.
 *
 * You can also add this as a task to deno.json which can be more convenient:
 *
 * ```json
 * {
 *   "tasks": {
 *     "compile": "deno compile --output my-app src/main.ts",
 *     "install": "deno task compile && deno run -A jsr:@sigmasd/install-app install my-app"
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
 *   4. Print instructions for next steps (creating your application's entrypoint, compiling, customizing the icon and install.json, and running the install command).
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
 *   "name": "<app_name>",         // The user-visible name of your application
 *   "id": "<app_id>",             // Optional: Linux Application ID (e.g., com.example.MyApp), The id is important for the icon to work correctly.
 *   "version": "<version_string>", // The version of your application (informational)
 *   "description": "<description>", // A short description of your application (informational)
 *   "icon": "<icon_name>.svg"   // The filename of your application's icon (within the assets directory)
 * }
 * ```
 *
 *  *   **`name`:**  The user-visible name of your application (e.g., "My Awesome App").
 *      This is used in the `.desktop` file. The executable file itself will
 *      be named based on a sanitized version of this name (or the sanitized `id` if provided).
 *  *   **`id` (Optional):** A unique identifier for your application, typically in
 *      reverse domain name notation (e.g., `com.example.MyApp`). *Required for standard
 *      Linux integration.* If provided:
 *      *   The icon file (must be `.svg`) will be installed to the standard
 *          system icon location (`~/.local/share/icons/hicolor/scalable/apps/<id>.svg`).
 *      *   The `.desktop` file will be named `<id>.desktop` in `~/.local/share/applications/`.
 *      *   The `Icon=` field in the `.desktop` file will use the `id`.
 *      *   The internal installation directory will still use the *sanitized* `name`.
 *  *   **`version`:**  The version of your application (e.g., "1.0.0").
 *  *   **`description`:** A short description of your application.
 *  *   **`icon`:** The filename of your application's icon file (e.g.,
 *      "my-app-icon.svg"). This file *must* be located in the `assets`
 *      directory. *If `id` is provided, this icon file must be an SVG.*
 *
 * **Installation Process (Linux):**
 *
 * 1.  **Directory Creation:** A base directory `deno-installed-apps` is created
 *     within the user's data directory (`~/.local/share/deno-installed-apps`).
 *     Inside this, a directory for the application is created using the *sanitized* `name`
 *     from `install.json` (e.g., `~/.local/share/deno-installed-apps/my_awesome_app`).
 *     Standard directories like `~/.local/share/applications` and
 *     `~/.local/share/icons/hicolor/scalable/apps` are ensured to exist.
 * 2.  **File Placement:**
 *     *   The compiled executable is moved into the application's specific directory
 *         (`deno-installed-apps/<sanitized_name>/<sanitized_name>`).
 *     *   A `metadata.json` file (containing the contents of `install.json`) is
 *         saved in the application's specific directory.
 *     *   **Icon:**
 *         *   If `id` is provided in `install.json`, the SVG icon is copied to
 *             `~/.local/share/icons/hicolor/scalable/apps/<id>.svg`.
 *         *   If `id` is *not* provided, the icon (any format) is copied into the
 *             application's specific directory (`deno-installed-apps/<sanitized_name>/<icon_name>`).
 * 3.  **Shortcut Creation (.desktop file):**
 *     *   A `.desktop` file is created in `~/.local/share/applications/`.
 *     *   **Filename:** Named `<id>.desktop` if `id` is provided, otherwise
 *         `<sanitized_name>.desktop`.
 *     *   **Contents:** Includes `Name`, `Exec` (pointing to the executable in
 *         `deno-installed-apps`), `Type`, `Categories`, and `Icon`.
 *         *   If `id` is provided, `Icon=<id>`.
 *         *   If `id` is *not* provided, `Icon=<full_path_to_icon_in_deno-installed-apps>`.
 *
 * **Other OSes:** Installation currently only supports Linux. A warning is printed
 * on other operating systems.
 *
 * **Example:**
 *
 * Given `install.json`:
 * ```json
 * {
 *   "name": "My App",
 *   "id": "com.example.my_app",
 *   "version": "1.0.0",
 *   "description": "My awesome app",
 *   "icon": "icon.svg"
 * }
 * ```
 * And executable `my-app-bin`.
 *
 * Running `deno run -A jsr:@sigmasd/install-app install my-app-bin` on Linux will:
 * 1. Create `~/.local/share/deno-installed-apps/My_App/`.
 * 2. Move `my-app-bin` to `~/.local/share/deno-installed-apps/My_App/My_App`.
 * 3. Copy `assets/icon.svg` to `~/.local/share/icons/hicolor/scalable/apps/com.example.my_app.svg`.
 * 4. Create `~/.local/share/applications/com.example.my_app.desktop` with `Name=My App`, `Exec=.../My_App/My_App`, and `Icon=com.example.my_app`.
 *
 * @module
 */

import { extname } from "jsr:@std/path@^1.0.8/extname";
import { join } from "jsr:@std/path@^1.0.8/join";
import { ensureDirSync, existsSync } from "jsr:@std/fs@1";
import { assert } from "jsr:@std/assert@^1/assert";
import { getDataDir, placeholderIconData } from "./utils.ts";

interface InstallMetadata {
  name: string;
  id?: string;
  version: string;
  description: string;
  icon: string;
}

const BASE_INSTALL_DIR_NAME = "deno-installed-apps";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function installApp(
  { executablePath, metadata, appDir }: {
    executablePath: string;
    metadata: InstallMetadata;
    appDir: string;
  },
) {
  const dataDir = getDataDir();
  assert(dataDir, "Could not determine user data directory.");
  const appsPath = join(dataDir, BASE_INSTALL_DIR_NAME);
  const binName = sanitizeFileName(metadata.name);
  const hostBinDirPath = join(appsPath, binName);
  ensureDirSync(hostBinDirPath);

  // 1. Install App
  Deno.renameSync(executablePath, join(hostBinDirPath, binName));
  Deno.writeTextFileSync(
    join(hostBinDirPath, "metadata.json"),
    JSON.stringify(metadata),
  );

  if (metadata.id) {
    const iconExt = extname(metadata.icon);
    if (iconExt !== ".svg") {
      throw new Error(
        `Unsupported icon format: ${iconExt}, we only support SVG icons with ID install for now.`,
      );
    }
    // 2. Install Icon
    Deno.copyFileSync(
      join(appDir, "assets", metadata.icon),
      join(
        dataDir,
        "icons",
        "hicolor",
        "scalable",
        "apps",
        `${metadata.id}${iconExt}`,
      ),
    );
    // 3. Install Metadata by creating a linux desktop file
    const applicationsDir = join(dataDir, "applications");
    ensureDirSync(applicationsDir); // Ensure applications directory exists.
    Deno.writeTextFileSync(
      join(applicationsDir, `${metadata.id}.desktop`),
      `
[Desktop Entry]
Name=${metadata.name}
Exec=${join(hostBinDirPath, binName)}
Icon=${metadata.id}
Type=Application
Categories=Utility;
`,
    );
  } else {
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
  }

  console.log(`Application "${metadata.name}" installed successfully.`);
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
        const metadataPath = join(appsPath, appName, "metadata.json");
        let id;

        if (existsSync(metadataPath)) {
          id = JSON.parse(Deno.readTextFileSync(metadataPath)).id;
        }

        const desktopFilePath = id
          ? join(
            dataDir,
            "applications",
            `${id}.desktop`,
          )
          : join(
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
  const binName = sanitizeFileName(appName);
  const appPath = join(dataDir, BASE_INSTALL_DIR_NAME, binName);

  if (!existsSync(appPath)) {
    console.log(`Application "${appName}" is not installed.`);
    return;
  }

  let metadata;
  try {
    metadata = JSON.parse(
      Deno.readTextFileSync(join(appPath, "metadata.json")),
    );
  } catch {
    /* ignore */
  }

  let desktopFilePath;
  if (metadata?.id) {
    desktopFilePath = join(
      dataDir,
      "applications",
      `${metadata?.id}.desktop`,
    );
  } else {
    desktopFilePath = join(
      dataDir,
      "applications",
      `${binName}.desktop`,
    );
  }

  try {
    Deno.removeSync(appPath, { recursive: true });
    Deno.removeSync(desktopFilePath);
    if (metadata?.id) {
      const iconExt = extname(metadata.icon);
      const iconPath = join(
        dataDir,
        "icons",
        "hicolor",
        "scalable",
        "apps",
        `${metadata.id}${iconExt}`,
      );
      Deno.removeSync(iconPath);
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
  console.log("1. Compile your application to an ex.");
  console.log("2. Customize assets/install.json with your app's details.");
  console.log("3. Replace assets/icon.svg with your application's icon.");
  console.log(
    `4. Run 'deno run -A jsr:@sigmasd/install-app install <executable_name>' to install.`,
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
      const executablePath = Deno.args[1];
      if (!executablePath) {
        console.log("Please provide the executable path");
        Deno.exit(1);
      }
      // Assuming the executable is in the project root or user-provided path.
      const appDir = Deno.cwd(); // Default to current working directory.  Best guess.

      const metadata = readMetaData({ appDir });
      if (!metadata) {
        console.log("Could not find install.json");
        Deno.exit(1);
      }
      installApp({ executablePath, metadata, appDir });
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
      uninstallApp(appName);
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
      console.log("  install <executable>     Install an application");
      console.log("  list                     List installed applications");
      console.log("  uninstall <app_name>     Uninstall an application");
      Deno.exit(1);
  }
}
