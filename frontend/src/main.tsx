import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import RequireAuth from "./RequireAuth";
import App from "./App";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Chatbot from "./pages/Chatbot";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<RequireAuth><App/></RequireAuth>}>
          <Route index element={<Dashboard/>} />
          <Route path="vehicles" element={<Vehicles/>} />
          <Route path="chatbot" element={<Chatbot/>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
