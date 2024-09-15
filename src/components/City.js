
import { buildingFactory } from '../buildings';

class City {
    constructor(size) {
        this.size = size;
        this.data = [];

        this.initialize();
    };

    initialize() {
        for (let x = 0; x < this.size; x++) {
            const column = [];
            for (let y = 0; y < this.size; y++) {
                const tile = createTile(x, y);
                column.push(tile);
            };
            this.data.push(column);
        };
    };

    update() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const building = this.data[x][y].building;

                if (building) {
                    building.update();
                };
            };
        };
    };
};

export default City;

function createTile(x, y) {
    const tile = { 
        x, 
        y,
        terrainId: "grass",
        building: undefined,
    };

    // Randomly assign a building to the tile with a 30% chance
    if (Math.random() < 0.3) {
        tile.building = buildingFactory("tree")();
    }

    return tile;
}