import { Webview } from "jsr:@webview/webview@0.9.0";

const webview = new Webview();
webview.title = "Example";

webview.navigate(`data:text/html,<h1>Hello World</h1>`);
webview.run();
Deno.exit(0);
