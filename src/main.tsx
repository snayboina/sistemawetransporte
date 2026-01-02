import { createRoot } from "react-dom/client";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import App from "./App.tsx";
import "./index.css";

import { ThemeProvider } from "./contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="dark" storageKey="swiftride-ui-theme">
        <App />
    </ThemeProvider>
);
