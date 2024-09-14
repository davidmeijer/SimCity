import React, { useState, useEffect } from "react";

import Scene from "./Scene.js";
import City from "./City.js";

const Game = () => {
    const initialCity = new City(10);
    const [iteration, setIteration] = useState(0);
    const [cityState, setCityState] = useState(initialCity);

    useEffect(() => {
        // Set up interval only once.
        const intervalId = setInterval(() => {
            cityState.update();
            setCityState(cityState);
            setIteration((prev) => prev + 1);
        }, 1000);

        // Cleanup interval on unmount or when component re-renders.
        return () => clearInterval(intervalId);
    }, [cityState]); // Only when cityState is updated manually elsewhere.

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Scene iteration={iteration} city={cityState} />
        </div>
    );
};

export default Game;