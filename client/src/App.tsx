import React from "react";
import logo from "./logo.svg";
import "./App.css";

import "bootstrap/dist/css/bootstrap.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./routes/Layout";
import Home from "./routes/Home";
import Planner from "./routes/Planner";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/planner" element={<Planner />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
