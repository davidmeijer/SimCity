const buildings = {
    "residential": () => {
        return {
            id: "residential",
            height: 1,
            updated: true,
            update: function() {
                if (Math.random() < 0.01) {
                    if (this.height <5) {
                        this.height += 1;
                        this.updated = true;
                    };
                };
            }
        };
    },
    "commercial": () => {
        return {
            id: "commercial",
            height: 1,
            updated: true,
            update: function() {
                if (Math.random() < 0.01) {
                    if (this.height < 5) {
                        this.height += 1;
                        this.updated = true;
                    };
                };
            }
        };
    },
    "industrial": () => {
        return {
            id: "industrial",
            height: 1,
            updated: true,
            update: function() {
                if (Math.random() < 0.01) {
                    if (this.height < 2) {
                        this.height += 1;
                        this.updated = true;
                    };
                };
            }
        };
    },
    "road": () => {
        return {
            id: "road",
            updated: true,
            update: function() {
                this.updated = false;  // After placement, no need to update.
            }
        };
    },
};

export function buildingFactory(type) {
    if (type in buildings) {
        return buildings[type];
    } else {
        console.warn(`Building ${type} not found.`);
        return undefined;
    }
};