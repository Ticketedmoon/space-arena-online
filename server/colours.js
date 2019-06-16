// Colours object
Colours = {};

// Colours listings
Colours.names = {
    0: "#ffd700",
    1: "#ffff00",
    2: "#00bfff",
    3: "#1e90ff",
    4: "#00ffff",
    5: "#7cfc00",
    6: "#7fff00",
    7: "#00fa9a",
    8: "#adff2f",
    9: "#32cd32",
    10: "#ff0000",
    11: "#ff4500",
    12: "#ff69b4",
    13: "#9370db",
    14: "#FFFF33"
};

// Colours random selection
Colours.random = function() {
    return this.names[Math.ceil(Math.random() * 14)];
};

module.exports = [Colours];