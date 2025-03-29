import { Webview } from "jsr:@webview/webview@0.9.0";
import { AdwApp } from "jsr:@sigmasd/adw-app@0.1.3";

const app = new AdwApp({ id: "io.github.sigmasd.example" });
app.run((window) => {
  const webview = new Webview(false, undefined, window);
  webview.title = "Example";
  webview.navigate(`data:text/html,<h1>Hello World</h1>`);
});
Deno.exit(0);
