# Install App

This module provides utilities for installing applications. It handles creating
the necessary directory structure, moving the executable, copying the icon, and
creating a .desktop file for Linux systems (or appropriate shortcuts on other
OSes). It also includes functionality for listing and uninstalling installed
applications, and initializing a new project.

**Usage:**

**Installation:**

```bash
deno run -A jsr:@sigmasd/install-app install <entrypoint.ts>
```

Where `<entrypoint.ts>` is the main entry point of your application that you
would normally compile.

You can also add this as a task to deno.json which can be more convenient:

```json
{
  "tasks": {
    "install": "deno run -A jsr:@sigmasd/install-app install <entrypoint.ts>"
  }
}
```

**Listing Installed Applications:**

```bash
deno run -A jsr:@sigmasd/install-app list
```

**Uninstalling an Application:**

```bash
deno run -A jsr:@sigmasd/install-app uninstall <app_name>
```

Where `<app_name>` is the name of the application as specified in its
`install.json` file.

**Initializing a new project:**

```bash
deno run -A jsr:@sigmasd/install-app init <app_name>
```

Where `<app_name>` is desired name for your application. This command will:

1. Create an `assets` directory in the current working directory.
2. Create a default `install.json` file inside the `assets` directory,
   pre-populated with the provided `<app_name>`.
3. Create a placeholder `icon.svg` file inside the `assets` directory.
4. Print instructions for next steps (creating your application's entrypoint,
   customizing the icon and install.json, and running the install command).

**Project Structure:**

Your project should have the following structure:

```
my-app/
├── assets/
│   ├── install.json  (Installation metadata)
│   └── <icon_name>.svg (Your application's icon, referenced in install.json)
├── src/
│   └── <entrypoint>.ts  (Your application's main entry point)
└── ... other files ...
```

**`install.json` Format:**

Create a file named `install.json` within the `assets` directory. This file
contains metadata about your application:

```jsonc
{
  "name": "<app_name>", // The name of your application (used for the executable and shortcut)
  "version": "<version_string>", // The version of your application (informational)
  "description": "<description>", // A short description of your application (informational)
  "icon": "<icon_name>.svg" // The filename of your application's icon (within the assets directory)
}
```

- **`name`:** The name of your application. This will be the name of the
  executable and the desktop shortcut/alias. _It should be a valid filename (no
  spaces or special characters)._
- **`version`:** The version of your application (e.g., "1.0.0").
- **`description`:** A short description of your application.
- **`icon`:** The filename of your application's icon file (e.g.,
  "my-app-icon.svg"). This file _must_ be located in the `assets` directory.

**Installation Process:**

1. **Compilation:** The script first compiles your application using
   `deno compile`. The output executable is named according to the `name` field
   in `install.json`.
2. **Directory Creation:** A directory named `deno-installed-apps` is created
   within the user's data directory (e.g., `%APPDATA%\deno-installed-apps` on
   Windows, `~/.local/share/deno-installed-apps` on Linux,
   `~/Library/Application Support/deno-installed-apps` on macOS). An
   `applications` directory is also created within the user's data directory, if
   it doesn't already exist.
3. **File Copying:**
   - The compiled executable is moved to the `deno-installed-apps/<name>`
     directory.
   - The application icon is copied to the `deno-installed-apps/<name>`
     directory.
4. **Shortcut Creation:**
   - **Linux:** A `.desktop` file is created in the `applications` directory,
     allowing the application to appear in application launchers.
   - **Other OSes:** A warning is printed that shortcut creation is not yet
     implemented.

**Example:**

If your application's entry point is `src/my_app.ts` and your `install.json`
contains:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My awesome app",
  "icon": "icon.svg"
}
```

You would install it with:

```bash
deno run -A jsr:@sigmasd/install-app install src/my_app.ts
```

This will create an executable named `my-app`, copy the icon, and create a
desktop shortcut/alias named `my-app`.
