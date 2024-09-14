import React, { useState } from "react";

import Scene from "./Scene.js";
import City from "./City.js";

const Game = () => {
    const [cityState, setCityState] = useState(new City(10));

    // Every 1000ms, update the city.
    setInterval(() => {

        // Count types of buildings in the city.
        const buildingCounts = {};
        for (let x = 0; x < cityState.size; x++) {
            for (let y = 0; y < cityState.size; y++) {
                const tile = cityState.data[x][y];
                if (tile.building) {
                    if (buildingCounts[tile.building]) {
                        buildingCounts[tile.building]++;
                    } else {
                        buildingCounts[tile.building] = 1;
                    };
                };
            };
        };
        console.log(buildingCounts);

        const city = cityState;
        city.update();
        setCityState(city);
    }, 1000);

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
            <Scene city={cityState} />
        </div>
    );
};

export default Game;