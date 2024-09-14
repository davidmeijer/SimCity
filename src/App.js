import React from "react";
import "./main.css";

import Scene from "./components/Scene";

function App() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Scene />
        </div>
    );
};

export default App;