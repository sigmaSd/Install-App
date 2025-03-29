# Install App

This module provides utilities for installing applications. It handles creating
the necessary directory structure, moving the executable, copying the icon, and
creating a .desktop file for Linux systems (or appropriate shortcuts on other
OSes). It also includes functionality for listing and uninstalling installed
applications, and initializing a new project.

**Usage:**

**Installation:**

```bash
deno run -A jsr:@sigmasd/install-app install <executable>
```

Where `<executable>` is the compiled executable of your application.

You can also add this as a task to deno.json which can be more convenient:

```json
{
  "tasks": {
    "compile": "deno compile --output my-app src/main.ts",
    "install": "deno task compile && deno run -A jsr:@sigmasd/install-app install my-app"
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
   compiling, customizing the icon and install.json, and running the install
   command).

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
  "name": "<app_name>", // The user-visible name of your application
  "id": "<app_id>", // Optional: Linux Application ID (e.g., com.example.MyApp), The id is important for the icon to work correctly.
  "version": "<version_string>", // The version of your application (informational)
  "description": "<description>", // A short description of your application (informational)
  "icon": "<icon_name>.svg" // The filename of your application's icon (within the assets directory)
}
```

- **`name`:** The user-visible name of your application (e.g., "My Awesome
  App"). This is used in the `.desktop` file. The executable file itself will be
  named based on a sanitized version of this name (or the sanitized `id` if
  provided).
- **`id` (Optional):** A unique identifier for your application, typically in
  reverse domain name notation (e.g., `com.example.MyApp`). _Required for
  standard Linux integration._ If provided:
  - The icon file (must be `.svg`) will be installed to the standard system icon
    location (`~/.local/share/icons/hicolor/scalable/apps/<id>.svg`).
  - The `.desktop` file will be named `<id>.desktop` in
    `~/.local/share/applications/`.
  - The `Icon=` field in the `.desktop` file will use the `id`.
  - The internal installation directory will still use the _sanitized_ `name`.
- **`version`:** The version of your application (e.g., "1.0.0").
- **`description`:** A short description of your application.
- **`icon`:** The filename of your application's icon file (e.g.,
  "my-app-icon.svg"). This file _must_ be located in the `assets` directory. _If
  `id` is provided, this icon file must be an SVG._

**Installation Process (Linux):**

1. **Directory Creation:** A base directory `deno-installed-apps` is created
   within the user's data directory (`~/.local/share/deno-installed-apps`).
   Inside this, a directory for the application is created using the _sanitized_
   `name` from `install.json` (e.g.,
   `~/.local/share/deno-installed-apps/my_awesome_app`). Standard directories
   like `~/.local/share/applications` and
   `~/.local/share/icons/hicolor/scalable/apps` are ensured to exist.
2. **File Placement:**
   - The compiled executable is moved into the application's specific directory
     (`deno-installed-apps/<sanitized_name>/<sanitized_name>`).
   - A `metadata.json` file (containing the contents of `install.json`) is saved
     in the application's specific directory.
   - **Icon:**
     - If `id` is provided in `install.json`, the SVG icon is copied to
       `~/.local/share/icons/hicolor/scalable/apps/<id>.svg`.
     - If `id` is _not_ provided, the icon (any format) is copied into the
       application's specific directory
       (`deno-installed-apps/<sanitized_name>/<icon_name>`).
3. **Shortcut Creation (.desktop file):**
   - A `.desktop` file is created in `~/.local/share/applications/`.
   - **Filename:** Named `<id>.desktop` if `id` is provided, otherwise
     `<sanitized_name>.desktop`.
   - **Contents:** Includes `Name`, `Exec` (pointing to the executable in
     `deno-installed-apps`), `Type`, `Categories`, and `Icon`.
     - If `id` is provided, `Icon=<id>`.
     - If `id` is _not_ provided,
       `Icon=<full_path_to_icon_in_deno-installed-apps>`.

**Other OSes:** Installation currently only supports Linux. A warning is printed
on other operating systems.

**Example:**

Given `install.json`:

```json
{
  "name": "My App",
  "id": "com.example.my_app",
  "version": "1.0.0",
  "description": "My awesome app",
  "icon": "icon.svg"
}
```

And executable `my-app-bin`.

Running `deno run -A jsr:@sigmasd/install-app install my-app-bin` on Linux will:

1. Create `~/.local/share/deno-installed-apps/My_App/`.
2. Move `my-app-bin` to `~/.local/share/deno-installed-apps/My_App/My_App`.
3. Copy `assets/icon.svg` to
   `~/.local/share/icons/hicolor/scalable/apps/com.example.my_app.svg`.
4. Create `~/.local/share/applications/com.example.my_app.desktop` with
   `Name=My App`, `Exec=.../My_App/My_App`, and `Icon=com.example.my_app`.
