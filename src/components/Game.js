import React, { useState, useEffect } from "react";
import { Button, Drawer, List, ListItem } from "@mui/material";

import Scene from "./Scene.js";
import City from "./City.js";
import { buildingFactory } from "../buildings.js";

const buttonConfigs = [
    { label: "bulldoze" },
    { label: "residential" },
    { label: "commercial" },
    { label: "industrial" },
    { label: "road" },
];

const Game = () => {
    const initialCity = new City(15);
    const [iteration, setIteration] = useState(0);
    const [cityState, setCityState] = useState(initialCity);
    const [activeToolId, setActiveToolId] = useState(null);

    const renderButtons = (configs) => {        
        return configs.map((config, index) => (
            <ListItem key={index}>
                <Button 
                    variant="contained" 
                    color={activeToolId === config.label ? "secondary" : "primary"}
                    onClick={() => {
                        // Unselect tool if it's already selected.
                        setActiveToolId(activeToolId === config.label ? null : config.label);
                    }}
                    style={{ width: "100%" }}
                >
                    {config.label}
                </Button>
            </ListItem>
        ));
    };

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

    const handleObjectSelected = (selectedObject) => {
        let { x, y } = selectedObject.userData;
        const tile = cityState.data[x][y];

        // Check if a tool is selected.
        if (!activeToolId) return;
        
        if (activeToolId === "bulldoze") {
            tile.building = undefined;
            setIteration((prev) => prev + 1);
        } else if (!tile.building) {
            tile.building = buildingFactory(activeToolId)();
            setIteration((prev) => prev + 1);
        };
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <Drawer
                variant="permanent"
                anchor="left"
                style={{ 
                    width: 240, 
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                }}
            >
                <List style={{ width: 240 }}>
                    {renderButtons(buttonConfigs)}
                </List>
            </Drawer>
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Scene 
                    iteration={iteration} 
                    city={cityState} 
                    onObjectSelected={handleObjectSelected}
                />
            </div>
        </div>
    );
};

export default Game;