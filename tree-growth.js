import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ConsoleEmitter from './console-emitter.js';
import defaultKeybind, { NONE, MOVE_DOWN, MOVE_UP, TOGGLE } from './actions.js';
import { refresh, getTreeDecor, nextEntry, lastEntry } from './utils.js';

var activeDir = process.argv.length > 2 ? process.argv[2] : process.cwd();
var data = {
    name: activeDir, 
    isDir: true,
    isCollasped: false,
    parent: null
}; 

var action;
var selected = activeDir;

renderBuffer = '';
render(data);
console.log(renderBuffer);
console.log('selected: ' + selected);
var ce = new ConsoleEmitter(defaultKeybind, NONE);
ce.on('action', (act) => {
    action = act;
    renderBuffer = '';
    render(data);
    console.log(renderBuffer);
    console.log('selected: ' + selected);
    action = NONE;
});



var renderBuffer = '';
function render(node) {
    refresh(node);
    processAction(node);

    // Draw
    let treeDecor = getTreeDecor(node);

    if(node.parent === null) {
        if(selected === node.name) {
            renderBuffer += chalk`{bgWhite.black.bold -+ ${path.basename(node.name)}}\n`;
        } else {
            renderBuffer += chalk`{grey -+} {green ${path.basename(node.name)}}\n`;
        }
    } else {
        if(selected === node.name) {
            renderBuffer += chalk` {bgWhite.black.bold ${treeDecor}|-${node.isCollasped ? '-' : '+'} ${path.basename(node.name)}}\n`;
        } else if (node.isError) {
            renderBuffer += chalk` {grey ${treeDecor}|-${node.isCollasped ? '-' : '+'}} {red ${path.basename(node.name)}}\n`;            
        } else {
            renderBuffer += chalk` {grey ${treeDecor}|-${node.isCollasped ? '-' : '+'}} {green ${path.basename(node.name)}}\n`;
        }
    }
    
    if(!node.isCollasped) {
        if(node.parent)
            treeDecor = treeDecor + (node.parent.contents.indexOf(node) < node.parent.contents.length - 1 ?  "| " : "  ");

        for(let i = 0; i < node.contents.length; i++) {
            let item = node.contents[i];
            if(item.isDir) render(item);
            else {
                if(item.name === selected)
                    renderBuffer += chalk` {bgWhite.black.bold ${treeDecor}|-+ ${path.basename(item.name)}}\n`;
                else if (item.isError)
                    renderBuffer += chalk` {grey ${treeDecor}|-+} {red ${path.basename(item.name)}}\n`;
                else
                    renderBuffer += chalk` {grey ${treeDecor}|-+} ${path.basename(item.name)}\n`;
            }
        }
    }
}



function processAction(node) {
    if(action === MOVE_UP) {
        action_move_up(node);
    } else if (action === MOVE_DOWN) {
        action_move_down(node);
    } else if (action === TOGGLE) {
        action_toggle(node);
    }
}

function action_move_up(node) {
    if(node.name === activeDir && node.name === selected) {
        if(!node.isCollasped)
        {
            let lastNode = lastEntry(node);
            selected = (lastNode.isDir && lastNode.contents.length > 0) ? lastNode.contents[lastNode.contents.length - 1].name : lastNode.name;
        }
        
    action = NONE;
    } else {
        try {
            let selIndex = node.contents.findIndex(x => x.name === selected);
            if(selIndex === 0) {
                selected = node.name;
                action = NONE;
            } else if(selIndex > 0) {
                selected = lastEntry(node.contents[selIndex - 1]).name;
                action = NONE;
            }
        } catch {}
    }
}

function action_move_down(node) {
    if(node === data) {
        let lastTreeNode = lastEntry(node)
        if(lastTreeNode.name === selected) {
            selected = node.name;
            action = NONE;
            return;
        }
    } 
    if (node.name === selected) {
        if(!node.isError && node.contents.length > 0 && !node.isCollasped) {
            selected = node.contents[0].name;
        } else {
            selected = nextEntry(node, data).name;
        }
        action = NONE;
    } else {
        try{
            let nodeIndex = node.contents.findIndex(x => x.name === selected);
            if(nodeIndex != -1) {
                if(node.contents[nodeIndex].isDir) return;
                
                if(nodeIndex + 1 < node.contents.length) {
                    selected = node.contents[nodeIndex + 1].name;
                } else {
                    selected = nextEntry(node, data).name;
                }
                action = NONE;
            }
        } catch {}
    }
}

function action_toggle(node) {
    if(node.name === selected && node.isDir && action === TOGGLE) {
        if(node.isError) {
            console.log(chalk`{red Operation failed: The folder is protected by the operating system!}`)
        } else {
            node.isCollasped = !node.isCollasped;
            action = NONE;
        }
    }
}