const journeyPhysics = "60d5ecb8b392d7001f8e9002";
const journeyEnglish = "60d5ecb8b392d7001f8e9003";

let nodes = [];
let nodeIdCounter = 136; // Continuing from previous batch

// Physics: Add 5 nodes (total 10, so order 6 to 10)
for (let order = 6; order <= 10; order++) {
    const suffix = nodeIdCounter.toString().padStart(3, '0');
    const _id = `60d5ecb8b392d7001f8ea${suffix}`;

    nodes.push({
        _id: _id,
        journeyId: journeyPhysics,
        title: `Day ${order}`,
        order: order,
        description: `Nội dung bài học ngày ${order} - Vật lý nâng cao.`,
        isOpen: true,
        createdAt: "2023-01-01T00:00:00.000Z"
    });
    nodeIdCounter++;
}

// English: Add 10 nodes (total 15, so order 6 to 15)
for (let order = 6; order <= 15; order++) {
    const suffix = nodeIdCounter.toString().padStart(3, '0');
    const _id = `60d5ecb8b392d7001f8ea${suffix}`;

    nodes.push({
        _id: _id,
        journeyId: journeyEnglish,
        title: `Day ${order}`,
        order: order,
        description: `Nội dung bài học ngày ${order} - Từ vựng và Ngữ pháp.`,
        isOpen: true,
        createdAt: "2023-01-01T00:00:00.000Z"
    });
    nodeIdCounter++;
}

// Output objects separated by comma, ready to be pasted inside the array
const jsonString = JSON.stringify(nodes, null, 2);
// Remove first [ and last ] to just get the objects
const content = jsonString.substring(1, jsonString.length - 1); // remove [ and ]
console.log("," + content); // Add comma at start
