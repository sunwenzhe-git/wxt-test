import { defineConfig } from "wxt";
import { CONTENT_SCRIPT_MATCHES } from "./utils/matches";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    side_panel: {
      default_path: "/sidepanel/index.html",
      theme: {
        backgroundColor: "#000", // 你想要的颜色
      },
    },
    extensionApi: "chrome",
    perBrowserTypes: true,
    permissions: [
      "activeTab",
      "scripting",
      "theme",
      "sidePanel",
      "devtools",
      "contextMenus",
      "storage",
      "webRequest",
    ],
    action: {},
    web_accessible_resources: [
      // Since the content script isn't listed in the manifest, we have to
      // manually allow the CSS file to load.
      {
        resources: ["/example-iframe.html"],
        matches: [CONTENT_SCRIPT_MATCHES],
      },
    ],
  },

  modules: ["@wxt-dev/module-react"],
  webExt: {
    startUrls: ["https://google.com"],
  },
});
