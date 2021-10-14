// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
// figma.ui.onmessage = msg => {
//   // One way of distinguishing between different types of messages sent from
//   // your HTML page is to use an object with a "type" property like this.
//   if (msg.type === 'create-rectangles') {
//     const nodes: SceneNode[] = [];
//     for (let i = 0; i < msg.count; i++) {
//       const rect = figma.createRectangle();
//       rect.x = i * 150;
//       rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
//       figma.currentPage.appendChild(rect);
//       nodes.push(rect);
//     }
//     figma.currentPage.selection = nodes;
//     figma.viewport.scrollAndZoomIntoView(nodes);
//   }
//
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
figma.ui.onmessage = async (msg) => {
    if (msg.event === 'set-async') {
        figma.clientStorage.setAsync(msg.key, msg.value);
        console.log(msg.key,msg.value);
    } else if (msg.event === 'get-async' && msg.key != null) {
        const ret = await figma.clientStorage.getAsync(msg.key);
        figma.ui.postMessage({
            event: 'get-async',
            key: msg.key,
            value: ret ? ret : null
        })
    }
}
/*
background: Array(1)
0: {type: "SOLID", visible: true, opacity: 1, blendMode: "NORMAL", color: {…}}
length: 1
__proto__: Array(0)
children: Array(1)
0: {type: "TEXT", layoutMode: undefined, primaryAxisSizingMode: undefined, counterAxisSizingMode: undefined, primaryAxisAlignItems: undefined, …}
length: 1
__proto__: Array(0)
counterAxisAlignItems: "CENTER"
counterAxisSizingMode: "AUTO"
fills: Array(1)
0: {type: "SOLID", visible: true, opacity: 1, blendMode: "NORMAL", color: {…}}
length: 1
__proto__: Array(0)
layoutMode: "NONE"
paddingBottom: 17
paddingLeft: 28
paddingRight: 28
paddingTop: 17
primaryAxisAlignItems: "CENTER"
primaryAxisSizingMode: "AUTO"
type: "FRAME"

background: Array(1)
0: {type: "SOLID", visible: true, opacity: 1, blendMode: "NORMAL", color: {…}}
length: 1
__proto__: Array(0)
children: Array(1)
0: {type: "TEXT", layoutMode: undefined, primaryAxisSizingMode: undefined, counterAxisSizingMode: undefined, primaryAxisAlignItems: undefined, …}
length: 1
__proto__: Array(0)
counterAxisAlignItems: "MIN"
counterAxisSizingMode: "AUTO"
fills: Array(1)
0: {type: "SOLID", visible: true, opacity: 1, blendMode: "NORMAL", color: {…}}
length: 1
__proto__: Array(0)
layoutMode: "HORIZONTAL"
paddingBottom: 17
paddingLeft: 28
paddingRight: 28
paddingTop: 17
primaryAxisAlignItems: "MIN"
primaryAxisSizingMode: "AUTO"
type: "FRAME"*/
function getChild(Node) {
    const children = Node.children;
    const ret= {
        type: Node.type,
        layoutMode: Node.layoutMode,
        primaryAxisSizingMode: Node.primaryAxisSizingMode,
        counterAxisSizingMode: Node.counterAxisSizingMode,
        primaryAxisAlignItems: Node.primaryAxisAlignItems,
        counterAxisAlignItems: Node.counterAxisAlignItems,
        paddingBottom: Node.paddingBottom,
        paddingLeft: Node.paddingLeft,
        paddingRight: Node.paddingRight,
        paddingTop: Node.paddingTop,
        background: Node.backgrounds,
        fills: Node.fills,
        children: children?children.map((child) => getChild(child)):[],
        id: Node.id
    }
    return ret
}
//TODO: 오브젝트 고를때마다 바뀌는 이벤트
setInterval(() => {
    const selection = figma.currentPage.selection;
    if (selection.length == 1) {
        // figma.ui.postMessage(selection);
        if (selection[0].type == "FRAME") {
            let obj = getChild(selection[0]);
            obj["status"] = 1;
            obj["event"] = 'select-change';
            figma.ui.postMessage(obj);

        } else if (selection[0].type == "COMPONENT") {
            let obj = getChild(selection[0]);
            obj["status"] = 0;
            obj["event"] = 'select-change';
            figma.ui.postMessage(obj);

        } else if (selection[0].type == "INSTANCE") {
            let obj = getChild(selection[0]);
            obj["status"] = 0;
            obj["event"] = 'select-change';
            figma.ui.postMessage(obj);
        }
        /*figma.ui.postMessage({
            status: 0,
            type: selection[0].type
        })*/

    } else {
        figma.ui.postMessage({
            status: 2,
            event: 'select-change',
            id: null,
        })
    }
}, 800);
//TODO: 실제 적용되는 컴포넌트
setInterval(async ()=>{
    const ret = await figma.clientStorage.getAsync('checkedList');
    figma.ui.postMessage({
        event: 'get-async',
        key: 'checkedList',
        value: ret ? ret : null
    })
},100);