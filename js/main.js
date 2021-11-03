
import { stellae } from "./vendor/stellae2.js";
import tweakpane from 'https://cdn.skypack.dev/tweakpane';

import { v4 as uuidv4 } from  'https://cdn.skypack.dev/uuid';

import apexcharts from 'https://cdn.skypack.dev/apexcharts';

//const pane = new tweakpane.Pane();
console.log(stellae)
var graph = undefined
var dataGraph = undefined
var selectedNode = undefined
var localConfig={
    simSpeed:500
}

var Reports = {
    status:{
        frame:0,
        nodes:{}
    },
    graph:{},
    json:""
}

var currentPropPane  = undefined
let id1= uuidv4()
let id2= uuidv4()
var currentPastedData ={
    toImport:"Past here to import"
}
var data = {
    nodes:[
        {
            id:id1,
            uuid:id1,
            x:0,
            y:0,
            name:"test",
            customColor:"#f27506",
            properties: {
                name: "test",
                type:"variable",
                value:5,
                function:"",
            }
        },
        {
            id:id2,
            uuid:id2,
            x:10,
            y:10,
            name:"tesst",
            customColor:"#f27506",
            properties: {
                name: "tesst",
                type:"variable",
                value:15,
                function:"",
            }
        }
    ],
    relationships:[],
    notes:[],
    groups:[]
}

start()

function updatePropPane(node){
    if(currentPropPane){
        currentPropPane.remove
    }

    // const PARAMS = {
    //     id: node.id,
    //     value: node.properties.value,
    //   };

    let PARAMS = node.properties

    currentPropPane= new tweakpane.Pane();
    currentPropPane.addInput(node, 'id');
    currentPropPane.addInput(node.properties, 'name');
    currentPropPane.addInput(node.properties, 'type');
    currentPropPane.addInput(node.properties, 'value');
    currentPropPane.addInput(node.properties, 'function');
    currentPropPane.addInput(node.properties, 'observe');
    if (node.properties.type == "event") {
        currentPropPane.addInput(node.properties, 'duration');
    }
    if (node.properties.type == "stock") {
        currentPropPane.addInput(node.properties, 'canGoNeg');
        currentPropPane.addInput(node.properties, 'delay');
    }
    

    currentPropPane.addMonitor(Reports   , 'json', {
        multiline: true,
        lineCount: 5,
      });
    
    currentPropPane.addInput(currentPastedData, 'toImport');
    currentPropPane.on('change', (ev) => {
        console.log(data);
        saveTree(data)
    });
    // const btn = currentPropPane.addButton({
    //     title: 'execute',
    //     label: 'counter',   // optional
    //   });

    
      
    // let count = 0;
    // btn.on('click', () => {
    //     count += 1;
    //     console.log(count);

    //     //var theInstructions = "alert('Hello World'); var x = 100";
    //     var theInstructions = "return " + "15*8";

        

    //     function createFunction1() {
            
    //         return new Function ("nodes","return " + PARAMS.function);
    //     }

    //     var F=createFunction1()
    //     var result = F(vars)
    //     alert(result)
    //     console.log(data)
    //     //return(F());
    // });
    const btnDeleteNode = currentPropPane.addButton({
        title: 'delete node',
        label: 'counter',   // optional
    });
    btnDeleteNode.on('click', () => {
        deleteNode()
    });
    const btnAddVariable = currentPropPane.addButton({
        title: 'Add Variable',
        label: 'counter',   // optional
    });
    btnAddVariable.on('click', () => {
        addVariableNode()
    });

    const btnStock = currentPropPane.addButton({
        title: 'Add Stock',
        label: 'counter',   // optional
    });
    btnStock.on('click', () => {
        addStockNode()
    });

    const btnFlux = currentPropPane.addButton({
        title: 'Add Flux',
        label: 'counter',   // optional
    });
    btnFlux.on('click', () => {
        addFluxNode()
    });

    const btnTable = currentPropPane.addButton({
        title: 'Add Table',
        label: 'counter',   // optional
    });
    btnTable.on('click', () => {
        addTableNode()
    });
    const btnEvent = currentPropPane.addButton({
        title: 'Add Event',
        label: 'counter',   // optional
    });
    btnEvent.on('click', () => {
        addEventNode()
    });

    const btnSimulate = currentPropPane.addButton({
        title: 'Simulate',
        label: 'counter',   // optional
    });
    btnSimulate.on('click', () => {
        startSimulation()
    });
    currentPropPane.addInput(localConfig, 'simSpeed', {
        min: 1,
        max: 2000,
      });
    const btnClearData = currentPropPane.addButton({
        title: 'clear local data',
        label: 'counter',   // optional
    });
    btnClearData.on('click', () => {
        deleteLocalData()
    });
    const btnExportData = currentPropPane.addButton({
        title: 'export',
        label: 'counter',   // optional
    });
    btnExportData.on('click', () => {
        exportData()
    });
    const btnImportData = currentPropPane.addButton({
        title: 'import',
        label: 'counter',   // optional
    });
    btnImportData.on('click', () => {
        let newData = JSON.parse(currentPastedData.toImport)
        data=newData
        update()
    });

    
}

function startSimulation() {
    let dupliData = JSON.parse(JSON.stringify(data))
    dupliData.nodes.forEach(element => {
        if (element.properties.type == "event") {
            element._sim = {
                started:0,
                finished:0,
                isStarting:0,
                isFinishing :0,
                elapsed:0,
            }
        }
        if (element.properties.type == "stock") {
            element._sim = {
                previousValue:[],
            }
        }
    });
    let orderedGraph = topologicalOrdering(dupliData)
    Reports.status.frame =0 
    
    step()
    
    function step() {
        console.log(Reports.status.frame)
        
        Reports.status.nodes = reportNodeStatus(orderedGraph, Reports.status.frame)
        archiveStatus(orderedGraph, Reports.graph, Reports.status.nodes)
        updateChart()

        console.log(Reports.graph)
        Reports.json = JSON.stringify(Reports.status, null, 2)
        Reports.status.frame++
        setTimeout(step, localConfig.simSpeed)
        
    }
    
}

function reportNodeStatus(orderedGraph, frame) {
    resolveNodes(orderedGraph, frame)
    var dataContainer = {}
    orderedGraph.orderedNodes.forEach(element => {
        dataContainer[element.id] = {name:element.name, value:element.properties.value }
    });
    return dataContainer
}

function archiveStatus(orderedGraph, archive, current) {
    // orderedGraph.orderedNodes.forEach(element => {
    //     if (!archive[element.id]) {
    //         archive[element.id] = []
    //     }
    //     archive[element.id].push(current[element.id].value)
    // });
    orderedGraph.orderedNodes.forEach(element => {
        if (!archive[element.id]) {
            archive[element.id] = {
                name:element.name,
                data :[],
                visible:element.properties.observe,
            }
        }
        archive[element.id].data.push(current[element.id].value)
    });
    return archive
}

function resolveNodes(orderedGraph, frame) {
    orderedGraph.orderedNodes.forEach(element => {
        element.properties.value = executeNodeFunction(orderedGraph.orderedNodes, element, orderedGraph.parentsList[element.id], orderedGraph.adgencyList[element.id], frame)
        if (element.properties.type == "flux") { //if node is a flux update nearby stocks
            updateNearbyStocks(orderedGraph.orderedNodes, element,orderedGraph.parentsList[element.id], orderedGraph.adgencyList[element.id], frame)
        }
        if (element.properties.type == "event") { //if node is an event update local status
            updateEvent(orderedGraph.orderedNodes, element,orderedGraph.parentsList[element.id], orderedGraph.adgencyList[element.id], frame)
        }
        
    });
    orderedGraph.orderedNodes.forEach(element => {
        if (element.properties.type == "stock") {
            recordStockValueForDelays(orderedGraph.orderedNodes, element,frame)//record the value of all stock to use for other anim frame
        }
    });
    
}

function executeNodeFunction(nodes, node, parents, children, frame) {
    
    if (node.properties.type == "variable" || node.properties.type == "flux"|| node.properties.type == "event") {
        if ( node.properties.function != "") {
            var vars={}
            parents.forEach(element => {
                var parentNode = nodes.find(n=> n.id == element)
                vars[ ""+parentNode.name+""]=parentNode.properties.value
                if (parentNode.properties.type =="event") { //use special prof of events
                    vars[ ""+parentNode.name+"_end"]=parentNode._sim.isFinishing
                    vars[ ""+parentNode.name+"_ended"]=parentNode._sim.finished
                }
            });
            if (node.properties.type == "flux") {
                children.forEach(element => {
                    
                    var childNode = nodes.find(n=> n.id == element)
                    if (childNode.properties.type =="stock") {
                        vars[ ""+childNode.name+""]=childNode.properties.value
                    }
                    
                });
            }
            var $={
                time:Reports.status.frame
            }
            console.log(node.id, vars);
            function createFunction1() {
                
                return new Function ("nodes,$","return " + node.properties.function);
            }
        
            var F=createFunction1()
            var result = F(vars,$)
            return result
        }else{
            return  node.properties.value
        }
    } 
    if (node.properties.type == "stock") {
        return  node.properties.value
    } 
    if (node.properties.type == "table") {
        if (node.properties.function != "" && node.properties.function[0] == "[" ) {
            let dataArray =JSON.parse(node.properties.function)

            return dataArray[Reports.status.frame] || 1
        }
    }
}

function updateNearbyStocks(nodes, node, parents, children, frame) {
    //check parents first
    let fluxValue = node.properties.value
    
    parents.forEach(element => {
        var parentNode = nodes.find(n=> n.id == element)
        if (parentNode.properties.type == "stock") {
            //check if enough in stock
            let stockValue = parentNode.properties.value 
            if (parentNode.properties.delay != 0) {
                console.log(frame, parentNode._sim.previousValue[frame-parentNode.properties.delay ])
                stockValue = parentNode._sim.previousValue[frame-parentNode.properties.delay ] || 0
            }
            console.log("trying check",fluxValue,stockValue)
            if (!parentNode.properties.canGoNeg && (stockValue - fluxValue <0 ||parentNode.properties.value - fluxValue <0)) { 
                console.log("trying neeeeeeeeeeeeeg",fluxValue,stockValue)
                fluxValue = Math.min(stockValue,parentNode.properties.value ) 
                console.log(fluxValue, parentNode.properties.value)
            }
            console.log("reeeeeeeeeeeeeeo",parentNode.properties.value,fluxValue)
            parentNode.properties.value -= fluxValue
        }
    });
    children.forEach(element => {
        var childrenNode = nodes.find(n=> n.id == element)
        if (childrenNode.properties.type == "stock") {
            childrenNode.properties.value += fluxValue
        }
    });
    
}
function recordStockValueForDelays(nodes, node,frame) {
    if (node.properties.type == "stock") {
        node._sim.previousValue.push(node.properties.value)
        return  node.properties.value
    } 
}

function updateEvent(nodes, node, parents, children, frame) {
    let isActive = true //check if event is active or not
    parents.forEach(element => {
        var parentNode = nodes.find(n=> n.id == element)
        if (parentNode.properties.type == "event") { //if parent is an event, check if finished
            if (!parentNode._sim.finished) {
                isActive = false
            }
        }
    });
    if (isActive) {
        if (node._sim.elapsed == 0) {
            node._sim.isStarting = 1
            node._sim.started=1     
        }
        if (node._sim.elapsed > 0) {
            node._sim.isStarting = 0
        }
        if (node._sim.elapsed > node.properties.duration) {
            node._sim.finished = 1
            node._sim.isFinishing =1
            console.log(node.name +" is finished")
        }
        if (node._sim.elapsed > node.properties.duration+1) {
            node._sim.isFinishing =0
        }
        node._sim.elapsed ++ 
        node.properties.value =1
    }else{
        node.properties.value =0
    }
    if (node._sim.finished) {
        node.properties.value =0 //set value again to 0
    }
}

function addVariableNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#f27506",
            properties: {
                type:"variable",
                name: name,
                value:5,
                function:"",
                observe:true,
            }
        }
    )
    update()
}

function addStockNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#089bc3",
            properties: {
                type:"stock",
                name: name,
                value:5,
                function:"",
                observe:true,
                canGoNeg:false,
                delay:0,
            }
        }
    )
    update()
}

function addFluxNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#ba4bca",
            properties: {
                type:"flux",
                name: name,
                value:5,
                function:"",
                observe:false,
            }
        }
    )
    update()
}
function addTableNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#ba9bca",
            properties: {
                type:"table",
                name: name,
                value:1,
                function:"",
                observe:false,
            }
        }
    )
    update()
}
function addEventNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#35bdb2",
            properties: {
                type:"event",
                name: name,
                value:5,
                function:"",
                duration:5,
                observe:true,
                
            }
        }
    )
    update()
}

function deleteNode() {
    if (selectedNode) {
        data.nodes = data.nodes.filter(n=>n.uuid != selectedNode)
        data.relationships = data.relationships.filter(r=>r.source != selectedNode).filter(r=>r.target != selectedNode)
    }
    update()
}

function deleteRelation(uuid) {
    if (uuid) {
        data.relationships = data.relationships.filter(n=>n.id != uuid)
    }
    update()
}



// function update(){
//     //graph.cleanAll()
//     graph.updateWithD3Data(data)
// }

async function linkNodes(node1, node2){
    //data.nodes = []
    data.relationships.push(
        {
            id:uuidv4(),
            startNode:node1.id,
            endNode:node2.id,
            source:node1.id,
            target:node2.id
        }
    )
    
}

function start() {
    data = reloadTree() || data
    updateNodes(data) //for new version
    if (data.nodesPositions) {
        data.nodesPositions.forEach(f =>{
            var match = data.nodes.find(c => c.uuid == f.uuid)
            if (match) {
              match.fx =f.fx ; match.x =f.fx;
              match.fy=f.fy; match.y =f.fy;
            }
          })
    }
    console.log(reloadTree() );
    render()
    setUpDataGraph()
    
}

function updateNodes(data){
    data.nodes.forEach(f =>{
        if (f.properties.observe == undefined) {
            f.properties.observe = f.properties.observe || true
        }
        if (f.properties.type == "stock") {
            f.properties.canGoNeg = f.properties.canGoNeg || false
            f.properties.delay = f.properties.delay || 0
        }
      })
}

function update() {
    data.nodesPositions = graph.exportNodesPosition()
    saveTree(data)
    //console.log(graph.exportNodesPosition())
    render()
}
function render(){
    document.querySelector(".graph").innerHTML=""
    graph = new stellae(".graph",{
        onLinkingEnd :async function (e) {
            console.log(e);
            await linkNodes(e[0],e[1])

            console.log("save tree",graph.exportNodesPosition());
            data.nodesPositions = graph.exportNodesPosition()
            saveTree(data)
            update()
          },
          onNodeClick:function (node,eventData) {
            console.log(node,eventData)
            updatePropPane(data.nodes.find(n=>n.uuid == node.uuid))
            selectedNode = node.uuid
            
          },
          onNodeDragEnd:function (node,eventData) {
              console.log("save tree",graph.exportNodesPosition());
            data.nodesPositions = graph.exportNodesPosition()
            saveTree(data)
          },
          onRelationshipDoubleClick:function (d) {
            console.log(d)
            var confirmed = confirm("delete"+ d.id)
            if (confirmed) {
                console.log("delte")
                deleteRelation(d.id)
            }
            data.nodesPositions = graph.exportNodesPosition()
            saveTree(data)
          
        },
    })

    //STYLE nodes
    let dupliData = JSON.parse(JSON.stringify(data))
    console.log(dupliData)
    dupliData.nodes.forEach(element => {
        if (element.properties.type == "flux") {
            element.extraLabel = "M0 168v-16c0-13.255 10.745-24 24-24h360V80c0-21.367 25.899-32.042 40.971-16.971l80 80c9.372 9.373 9.372 24.569 0 33.941l-80 80C409.956 271.982 384 261.456 384 240v-48H24c-13.255 0-24-10.745-24-24zm488 152H128v-48c0-21.314-25.862-32.08-40.971-16.971l-80 80c-9.372 9.373-9.372 24.569 0 33.941l80 80C102.057 463.997 128 453.437 128 432v-48h360c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24z"
        }
        if (element.properties.type == "stock") {
            // element.extraLabel = "M425.7 256c-16.9 0-32.8-9-41.4-23.4L320 126l-64.2 106.6c-8.7 14.5-24.6 23.5-41.5 23.5-4.5 0-9-.6-13.3-1.9L64 215v178c0 14.7 10 27.5 24.2 31l216.2 54.1c10.2 2.5 20.9 2.5 31 0L551.8 424c14.2-3.6 24.2-16.4 24.2-31V215l-137 39.1c-4.3 1.3-8.8 1.9-13.3 1.9zm212.6-112.2L586.8 41c-3.1-6.2-9.8-9.8-16.7-8.9L320 64l91.7 152.1c3.8 6.3 11.4 9.3 18.5 7.3l197.9-56.5c9.9-2.9 14.7-13.9 10.2-23.1zM53.2 41L1.7 143.8c-4.6 9.2.3 20.2 10.1 23l197.9 56.5c7.1 2 14.7-1 18.5-7.3L320 64 69.8 32.1c-6.9-.8-13.5 2.7-16.6 8.9z"
            element.extraLabel = "M488.6 250.2L392 214V105.5c0-15-9.3-28.4-23.4-33.7l-100-37.5c-8.1-3.1-17.1-3.1-25.3 0l-100 37.5c-14.1 5.3-23.4 18.7-23.4 33.7V214l-96.6 36.2C9.3 255.5 0 268.9 0 283.9V394c0 13.6 7.7 26.1 19.9 32.2l100 50c10.1 5.1 22.1 5.1 32.2 0l103.9-52 103.9 52c10.1 5.1 22.1 5.1 32.2 0l100-50c12.2-6.1 19.9-18.6 19.9-32.2V283.9c0-15-9.3-28.4-23.4-33.7zM358 214.8l-85 31.9v-68.2l85-37v73.3zM154 104.1l102-38.2 102 38.2v.6l-102 41.4-102-41.4v-.6zm84 291.1l-85 42.5v-79.1l85-38.8v75.4zm0-112l-102 41.4-102-41.4v-.6l102-38.2 102 38.2v.6zm240 112l-85 42.5v-79.1l85-38.8v75.4zm0-112l-102 41.4-102-41.4v-.6l102-38.2 102 38.2v.6z"
        }
        if (element.properties.type == "variable") {
            element.extraLabel = "M440.667 182.109l7.143-40c1.313-7.355-4.342-14.109-11.813-14.109h-74.81l14.623-81.891C377.123 38.754 371.468 32 363.997 32h-40.632a12 12 0 0 0-11.813 9.891L296.175 128H197.54l14.623-81.891C213.477 38.754 207.822 32 200.35 32h-40.632a12 12 0 0 0-11.813 9.891L132.528 128H53.432a12 12 0 0 0-11.813 9.891l-7.143 40C33.163 185.246 38.818 192 46.289 192h74.81L98.242 320H19.146a12 12 0 0 0-11.813 9.891l-7.143 40C-1.123 377.246 4.532 384 12.003 384h74.81L72.19 465.891C70.877 473.246 76.532 480 84.003 480h40.632a12 12 0 0 0 11.813-9.891L151.826 384h98.634l-14.623 81.891C234.523 473.246 240.178 480 247.65 480h40.632a12 12 0 0 0 11.813-9.891L315.472 384h79.096a12 12 0 0 0 11.813-9.891l7.143-40c1.313-7.355-4.342-14.109-11.813-14.109h-74.81l22.857-128h79.096a12 12 0 0 0 11.813-9.891zM261.889 320h-98.634l22.857-128h98.634l-22.857 128z"
        }
        if (element.properties.type == "event") {
            element.extraLabel = "M256 64C110.06 64 0 125.91 0 208v98.13C0 384.48 114.62 448 256 448s256-63.52 256-141.87V208c0-82.09-110.06-144-256-144zm0 64c106.04 0 192 35.82 192 80 0 9.26-3.97 18.12-10.91 26.39C392.15 208.21 328.23 192 256 192s-136.15 16.21-181.09 42.39C67.97 226.12 64 217.26 64 208c0-44.18 85.96-80 192-80zM120.43 264.64C155.04 249.93 201.64 240 256 240s100.96 9.93 135.57 24.64C356.84 279.07 308.93 288 256 288s-100.84-8.93-135.57-23.36z"
        }
        if (element.properties.type == "table") {
            element.extraLabel = "M464 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM224 416H64v-96h160v96zm0-160H64v-96h160v96zm224 160H288v-96h160v96zm0-160H288v-96h160v96z"
        }
    });
    dupliData.relationships.forEach(element => {
        element.displayType =">"
    });
    graph.updateWithD3Data(dupliData)
}

function saveTree(data) {
    window.localStorage.setItem('lastTree', JSON.stringify(data));
}
function reloadTree() {
    const tree = window.localStorage.getItem('lastTree');
    return JSON.parse(tree)
}
function deleteLocalData() {
    window.localStorage.clear();
}

function exportData() {
    console.log(data)
    
    const downloadToFile = (content, filename, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        
        a.href= URL.createObjectURL(file);
        a.download = filename;
        a.click();
      
          URL.revokeObjectURL(a.href);
    };
    downloadToFile(JSON.stringify(data), "compass.txt", 'text/plain')
}

function setUpDataGraph() {
    var options = {
        chart: {
          type: 'line'
        },
        series: [{
          name: 'sales',
          data: [30,40,35,50,49,60,70,91,125]
        }],
        // xaxis: {
        //   categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
        // }
      }
      
      chart = new apexcharts(document.querySelector("#chart"), options);
      
      chart.render();
}

function updateChart() {

    let newSeries = []
    for (const key in Reports.graph) {
        if (Reports.graph.hasOwnProperty.call(Reports.graph, key)) {
            const element = Reports.graph[key];
            if (element.visible) {
                newSeries.push({
                    name: element.name,
                    data: element.data
                  })
            }
            
        }
    }
    chart.updateSeries(newSeries)
}

//HELPERS

function topologicalOrdering(data) {
    let adgencyList = createAdgencyList(data);
    let parentsList = createParentsList(data);
    let order = dfsTopSort(data, adgencyList);
    console.log(order)
    let ordered = data.nodes.sort((a,b)=>{
        return order[a.id]>order[b.id]
    })
    console.log(ordered)
    return {
        orderedNodes:ordered,
        order:order,
        adgencyList:adgencyList,
        parentsList:parentsList,
    }
    
    
    function createAdgencyList(data) {
        let adgencyList = {};
        data.nodes.forEach(element => {
            adgencyList[element.id]=[]
        });

        data.relationships.forEach(element => {
            console.log(adgencyList,element.source)
            adgencyList[element.startNode].push(element.endNode)
        });
        return adgencyList
    }
    function createParentsList(data) {
        let parentsList = {};
        data.nodes.forEach(element => {
            parentsList[element.id]=[]
        });

        data.relationships.forEach(element => {
            console.log(adgencyList,element.source)
            parentsList[element.endNode].push(element.startNode)
        });
        return parentsList
    }
    function dfsTopSortHelper(v, n, visited, topNums, adjacencyList) {
        visited[v] = true;
        const neighbors = adjacencyList[v];
        for (const neighbor of neighbors) {
            if (!visited[neighbor]) {
                n = dfsTopSortHelper(neighbor, n, visited, topNums,adjacencyList);
            }
        }
        topNums[v] = n;
        return n - 1;
    }

    function dfsTopSort(data, adgencyList) {
        const vertices = Object.keys(adgencyList);
        const visited = {};
        const topNums = {};
        let n = vertices.length - 1;
        for (const v of vertices) {
            if (!visited[v]) {
                n = dfsTopSortHelper(v, n, visited, topNums, adgencyList)
            }
        }
        return topNums;
    }
    
    //console.log(dfsTopSort(graph));
}




// var dataToD3Format = function (data) {
//     var count =0
//     return {
//       nodes : data.nodes.map((e) => {
//         e.id=e.uuid;
//         e.properties= {
//                 name: e.name + " " + (e.lastName || ""),
//             }
//         return e
//       }),
//       relationships : data.relationships
//         .filter(e=>{
//           var foundSourceNodeToConnect = data.nodes.find(i=>i.uuid == e.source)
//           var foundTargetNodeToConnect = data.nodes.find(i=>i.uuid == e.target)
//           return (foundSourceNodeToConnect && foundTargetNodeToConnect)
//         })
//         .map((e) => {
//           e.id=count++;
//           e.startNode = e.source;
//           e.endNode=e.target;
//           e.properties= {
//                   from: 1470002400000
//               }
//           return e
//         }),
//       notes: data.notes.map((e) => {
//         e.id=e.uuid;
//         return e
//       }),
//       groups: data.groups.map((e) => {
//         e.id=e.uuid;
//         return e
//       }),
//     }
//   }
