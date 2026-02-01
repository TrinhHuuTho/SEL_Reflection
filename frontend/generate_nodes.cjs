const fs = require('fs');
const path = require('path');

const journeyIds = [];
for (let i = 1; i <= 27; i++) {
    const suffix = i.toString().padStart(3, '0');
    journeyIds.push(`60d5ecb8b392d7001f8e9${suffix}`);
}

let nodes = [];
let nodeIdCounter = 1;

journeyIds.forEach(journeyId => {
    for (let order = 1; order <= 5; order++) {
        const suffix = nodeIdCounter.toString().padStart(3, '0');
        // Using 'a' to distinguish nodes. 60d5ecb8b392d7001f8e a 001
        const _id = `60d5ecb8b392d7001f8ea${suffix}`;

        nodes.push({
            _id: _id,
            journeyId: journeyId,
            title: `Day ${order}`,
            order: order,
            description: `Nội dung bài học ngày ${order} về khám phá kiến thức mới của hành trình này.`,
            isOpen: true,
            createdAt: "2023-01-01T00:00:00.000Z"
        });
        nodeIdCounter++;
    }
});

const content = `export const nodes = ${JSON.stringify(nodes, null, 2)};`;

const targetPath = path.join(__dirname, 'src/mocks/nodes.js');
fs.writeFileSync(targetPath, content);
console.log(`Generated ${nodes.length} nodes at ${targetPath}`);
