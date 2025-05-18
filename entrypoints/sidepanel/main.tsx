import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import theme from "@/utils/theme";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ContextMenuProvider } from "mantine-contextmenu";

import "@mantine/core/styles.layer.css";
import "mantine-contextmenu/styles.layer.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="auto" theme={theme}>
      <ContextMenuProvider
        styles={{
          item: { fontSize: "11px" },
        }}
      >
        <App />
      </ContextMenuProvider>
    </MantineProvider>
  </React.StrictMode>
);
