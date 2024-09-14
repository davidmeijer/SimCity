
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
                this.data[x][y].building?.update();
            };
        };
    };
};

export default City;

function createTile(x, y) {
    return { 
        x, 
        y,
        terrainId: "grass",
        building: undefined,
    };
}