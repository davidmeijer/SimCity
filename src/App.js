import React from "react";
import "./main.css";

import Game from "./components/Game";

function App() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
            }}
        >
            <Game />
        </div>
    );
};

export default App;