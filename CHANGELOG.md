## Changelog

### 0.6.0

*   **Features:**
    *   Added support for specifying an application ID (`id`) in `install.json`.
        This is used for standard Linux integration.
    *   When an `id` is provided:
        *   The icon file (must be `.svg`) is installed to the standard system
            icon location (`~/.local/share/icons/hicolor/scalable/apps/<id>.svg`).
        *   The `.desktop` file is named `<id>.desktop` in
            `~/.local/share/applications/`.
        *   The `Icon=` field in the `.desktop` file uses the `id`.
        *   The internal installation directory still uses the _sanitized_ `name`.

### v0.5.0

*   **feat**: Change `install` argument to accept the application executable path instead of the source entrypoint.
*   **feat**: Remove `compileApp` function, the compilation is expected to be done manually.
