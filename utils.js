import fs from 'fs';

export function refresh(node) {
        if(node.isDir) {
            try {
                node.contents = fs.readdirSync(node.name).map(x => {
                    let name = `${node.name}\\${x}`;
                    let old = node.contents && node.contents.find(x => x.name === name);
                    try{
                        return {
                            isDir: fs.statSync(name).isDirectory(), 
                            name: name, 
                            isCollasped: old ? old.isCollasped : true,
                            contents: old && old.contents,
                            parent: node
                        }
                    } catch {
                        return {
                            isDir: false,
                            name: name,
                            isCollasped: true,
                            parent: node,
                            isError: true
                        };
                    }
                });
            } catch {
                node.isError = true;
                node.isCollasped = true;
            }
        }
}

export function getTreeDecor(node) {
    let treeDecor = "";
    let childNode = node.parent;
    let parentNode = childNode && node.parent.parent;
    while(parentNode) {
        treeDecor = (parentNode.contents.indexOf(childNode) < parentNode.contents.length - 1 ? "| " : "  ") + treeDecor;
        childNode = parentNode;
        parentNode = parentNode.parent;
    }

    return treeDecor;
}

export function nextEntry (lastNode, data) {
    while(lastNode.parent) {
        let lastNodeIndex = lastNode.parent.contents.findIndex(x => x === lastNode);
        if(lastNode.parent.contents.length - 1 > lastNodeIndex) {
            return lastNode.parent.contents[lastNodeIndex + 1];
        } else {
            lastNode = lastNode.parent;
        }
    }
    return data;
}

export function lastEntry(node, ignoreCollasped = true) {
    let lastNode = node;
    refresh(lastNode);
    while((!lastNode.isCollasped || !ignoreCollasped) && lastNode.isDir && lastNode.contents.length > 0) {
        lastNode = lastNode.contents[lastNode.contents.length - 1];
        if(!lastNode.isCollasped) refresh(lastNode);
    }
    return lastNode;
}