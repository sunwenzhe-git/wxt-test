import "./style.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createIntegratedUi, createIframeUi } from "#imports";

// export default defineContentScript({
//   registration: "runtime",
//   cssInjectionMode: "ui",

//   matches: [],
//   async main(ctx) {
//     const ui = await createShadowRootUi(ctx, {
//       name: "active-tab-ui",
//       position: "inline",
//       append: "before",
//       onMount(container) {
//         const app = document.createElement("p");
//         app.textContent = "Hello active tab!";
//         container.append(app);
//       },
//     });
//     ui.mount();
//     return "Hello world!";
//   },
// });
// export default defineContentScript({
//   registration: "runtime",
//   cssInjectionMode: "ui",

//   matches: [],
//   async main(ctx) {
//     const ui = await createIntegratedUi(ctx, {
//       position: "inline",
//       append: "before",
//       onMount(container) {
//         const wrapper = document.createElement("div");
//         container.append(wrapper);

//         const root = ReactDOM.createRoot(wrapper);
//         root.render(<App />);
//       },
//     });
//     ui.mount();
//     return "Hello world!";
//   },
// });

export default defineContentScript({
  registration: "runtime",
  matches: ["<all_urls>"],

  main(ctx) {
    console.log("Content script running...");

    try {
      // Define the UI
      const ui = createIframeUi(ctx, {
        page: "/example-iframe.html",
        position: "inline",
        anchor: "body",
        onMount: (wrapper, iframe) => {
          console.log("iframe mounted");
          iframe.width = "100%";
          iframe.height = "300px";
          iframe.style.border = "2px solid red"; // 使边框可见以便调试

          wrapper.style.margin = "10px 0";
        },
        onRemove: () => {
          console.log("iframe UI 已移除");
        },
      });

      // Show UI to user
      ui.autoMount();
      console.log("UI mount called");
    } catch (error) {
      console.error("Error creating iframe UI:", error);
    }
  },
});
