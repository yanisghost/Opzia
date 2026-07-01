// src/main.jsx
// Application entry point. Imports global styles before mounting React.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./styles/reset.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
