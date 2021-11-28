
import { stellae } from "./vendor/stellae2.js";
import { createAdler } from "./adler.js";
import tweakpane from 'https://cdn.skypack.dev/tweakpane';

import { v4 as uuidv4 } from  'https://cdn.skypack.dev/uuid';

import apexcharts from 'https://cdn.skypack.dev/apexcharts';

import { renderWelcomeScreen } from "./welcome.js";

//const pane = new tweakpane.Pane();

console.log(stellae)
var graph = undefined
var currentGraphTransformation = undefined;
var chart = undefined;
var dataGraph = undefined
var selectedNode = undefined
var localConfig={
    simSpeed:500,
    simPaused:false,
    simStarted:false,
    simCurrentOrderedGraph: undefined,
    currentCelestialArchive:"",
    chartScale:1,
    chartOffset:0,
}

var Reports = {
    status:{
        frame:0,
        scaledFrames:[],
        nodes:{},
    },
    graph:{},
    json:""
}

var currentPropPane  = undefined
var currentSimPane  = undefined
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
            name:"variable_1",
            customColor:"#f27506",
            properties: {
                name: "variable_1",
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
            name:"variable_2",
            customColor:"#f27506",
            properties: {
                name: "variable_2",
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

function createSimPane() {
    currentSimPane= new tweakpane.Pane({
        container:document.querySelector('.simControls'),
        //title: localConfig.currentCelestialArchive,
    });

    const tab = currentSimPane.addTab({
        pages: [
          {title: 'Simulate'},
          {title: 'Edit'},
          {title: 'Save'},
        ],
      });
      tab.pages[0].addMonitor(localConfig, 'currentCelestialArchive');
    tab.pages[0].addMonitor(Reports.status, 'frame', {});
    console.log(localConfig.currentCelestialArchive)


    const btnSimulate = tab.pages[0].addButton({
        title: 'Simulate',
    });
    btnSimulate.on('click', () => {
        startSimulation()
    });
    const btnPlayPause= tab.pages[0].addButton({
        title: 'pause/play',
    });
    btnPlayPause.on('click', () => {
        if (localConfig.simPaused || !localConfig.simStarted) {
            startSimulation()
            
        }else{
            localConfig.simPaused =true
        }
        
    });

    // const pOptions = tab.pages[0].addFolder({
    //     title: 'Options',
    //     expanded: false,   // optional
    //   });
    tab.pages[0].addInput(localConfig, 'simSpeed', {
        min: 1,
        max: 2000,
      });
    
    tab.pages[0].addInput(localConfig, 'chartScale', {});
    tab.pages[0].addInput(localConfig, 'chartOffset', {});
    tab.pages[0].addSeparator();
    const btnToggleChart = tab.pages[0].addButton({
    title: 'Show/hide Chart',
    });
    btnToggleChart.on('click', () => {
        let status = document.querySelector("#chart").style.visibility
        console.log(status)
        if (status == "visible") {
            document.querySelector("#chart").style.visibility = "hidden"
        }else{document.querySelector("#chart").style.visibility = "visible" }
    });
    const btnHideLabels= tab.pages[0].addButton({
        title: 'Hide labels',
    });
    btnHideLabels.on('click', () => {
        graph.clearAllLabels()
    });
    tab.pages[2].addMonitor(localConfig, 'currentCelestialArchive');
    tab.pages[2].addSeparator();
    // const btnNewFile = tab.pages[2].addButton({
    //     title: 'New',
    // });
    // btnNewFile.on('click', () => {
    //     deleteLocalData()
    // });

    

    const btnSaveData = tab.pages[2].addButton({
        title: 'Save',
    });
    btnSaveData.on('click', () => {
        if (localConfig.currentCelestialArchive != "") {
            recordTree(data)
        }else{
            var promptValue = prompt("Name")
            recordTree(data, promptValue) 
            currentSimPane.refresh()
        }
    });
    const btnSaveDataAs = tab.pages[2].addButton({
        title: 'Save As',
    });
    btnSaveDataAs.on('click', () => {
        var promptValue = prompt("Name")
        recordTree(data, promptValue || "Untitled")
        currentSimPane.refresh()
    });
    // const btnLoadData = tab.pages[2].addButton({
    //     title: 'Load',
    // });
    // btnLoadData.on('click', () => {
    //     loadOrSaveAs("load")
    //     currentSimPane.refresh()
    //     console.log(localConfig.currentCelestialArchive)
    // });
    // tab.pages[2].addSeparator();
    // const btnClearData = tab.pages[2].addButton({
    //     title: 'Delete Saved Data',
    // });
    // btnClearData.on('click', () => {
    //     loadOrSaveAs("delete")
    // });

    tab.pages[2].addSeparator();
    const btnExportData = tab.pages[2].addButton({
        title: 'export',
    });
    btnExportData.on('click', () => {
        exportData()
    });
    const btnImportData = tab.pages[2].addButton({
        title: 'import',
    });
    btnImportData.on('click', () => {
        let newData = JSON.parse(currentPastedData.toImport)
        data=newData
        update()
    });
    
    
    tab.pages[2].addInput(currentPastedData, 'toImport');

    tab.pages[1].addSeparator();
    const f1 = tab.pages[1].addFolder({
        title: 'System Dynamics',
        expanded: true,   // optional
      });

    const btnAddVariable = f1.addButton({
        title: 'Add Variable',
    });
    btnAddVariable.on('click', () => {
        addVariableNode()
    });

    const btnStock = f1.addButton({
        title: 'Add Stock',
    });
    btnStock.on('click', () => {
        addStockNode()
    });

    const btnFlux = f1.addButton({
        title: 'Add Flux',
    });
    btnFlux.on('click', () => {
        addFluxNode()
    });

    const btnTable = f1.addButton({
        title: 'Add Table',
    });
    btnTable.on('click', () => {
        addTableNode()
    });
    tab.pages[1].addSeparator();
    const f2 = tab.pages[1].addFolder({
        title: 'Discrete Events',
        expanded: false,   // optional
      });
    const btnEvent = f2.addButton({
        title: 'Add Event',
    });
    btnEvent.on('click', () => {
        addEventNode()
    });const btnLoop = f2.addButton({
        title: 'Add Loop',
    });
    btnLoop.on('click', () => {
        addLoopNode()
    });

    const f3 = tab.pages[1].addFolder({
        title: 'Helpers',
        expanded: false,   // optional
      });

    const btnNote = f3.addButton({
        title: 'Add Note',
    });
    btnNote.on('click', () => {
        addNote()
    });

    const btnGroup = f3.addButton({
        title: 'Add Group',
    });
    btnGroup.on('click', () => {
        addGroup()
    });

    
    
    tab.pages[1].addSeparator();

    document.addEventListener('keydown', function (event) {
        if (event.key == "ArrowRight") {
            simulateNextStep()
        }
        if (event.key == "b") {
            graph.setSelectionModeActive()
        }
    })
}



function updatePropPane(node){
    if(currentPropPane){
       // currentPropPane.remove()
       document.querySelector('.nodeControls').innerHTML=''
    }

    // const PARAMS = {
    //     id: node.id,
    //     value: node.properties.value,
    //   };

    let PARAMS = node.properties

    currentPropPane= new tweakpane.Pane({title: node.properties.name,container: document.querySelector('.nodeControls')});
    currentPropPane.addInput(node, 'id');
    currentPropPane.addInput(node.properties, 'name');
    currentPropPane.addInput(node.properties, 'type');
    if (node.properties.type != "table") {
        currentPropPane.addInput(node.properties, 'value');
    }
    if (node.properties.type != "stock") {
        currentPropPane.addInput(node.properties, 'function');
    }
    if (node.properties.type == "table") {
        currentPropPane.addInput(node.properties, 'spread');
        currentPropPane.addInput(node.properties, 'round');
        currentPropPane.addInput(node.properties, 'offset');
    }

    if (node.properties.type == "event") {
        currentPropPane.addInput(node.properties, 'condition');
    }
    if (node.properties.type == "loop") {
        currentPropPane.addInput(node.properties, 'iterations');
        currentPropPane.addInput(node.properties, 'condition');
    }
    currentPropPane.addSeparator();
    currentPropPane.addInput(node.properties, 'observe');
    if (node.properties.type == "event") {
        currentPropPane.addInput(node.properties, 'duration');
    }
    if (node.properties.type == "stock") {
        currentPropPane.addInput(node.properties, 'canGoNeg');
        currentPropPane.addInput(node.properties, 'delay');
    }
    
    // currentPropPane.addMonitor(Reports   , 'json', {
    //     multiline: true,
    //     lineCount: 5,
    //   });
    
    
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

    currentPropPane.addSeparator();
    const btnRenameNode = currentPropPane.addButton({
        title: 'Rename node',
    });
    btnRenameNode.on('click', () => {
        renameNode()
    });
    const btnDeleteNode = currentPropPane.addButton({
        title: 'Delete node',
    });
    btnDeleteNode.on('click', () => {
        deleteNode()
    });
    const btnDeleteNodes = currentPropPane.addButton({
        title: 'Delete nodes',
    });
    btnDeleteNodes.on('click', () => {
        deleteNodes()
    });
    const btnDuplicateNodes = currentPropPane.addButton({
        title: 'Duplicate nodes',
    });
    btnDuplicateNodes.on('click', () => {
        duplicateNodes()
    });
    currentPropPane.addSeparator();




    
}

function startSimulation() {
    if (localConfig.simStarted==false) {
        document.querySelector("#chart").style.visibility="visible";
        localConfig.simStarted = true 
        //set up simulation if from the start
        let dupliData = JSON.parse(JSON.stringify(data))
        dupliData.nodes.forEach(element => {
            if (element.properties.type == "event") {
                element._sim = {
                    started:0,
                    finished:0,
                    isStarting:0,
                    isFinishing :0,
                    elapsed:0,
                    inLoops:{}
                }
            }
            if (element.properties.type == "stock") {
                element._sim = {
                    previousValue:[],
                }
            }
            if (element.properties.type == "flux") {
                element._sim = {
                    flux:0,
                    left:0,
                }
            }
            if (element.properties.type == "loop") {
                element._sim = {
                    currentIteration:0,
                }
            }
        });
        localConfig.simCurrentOrderedGraph = topologicalOrdering(dupliData)
        Reports.status.frame =0 
        
    }
    localConfig.simPaused = false
    step()
    
}
function simulateNextStep() {
    if (localConfig.simStarted==true) {
        step()
    }
}

function step() {
    console.log(Reports.status.frame)
    
    Reports.status.nodes = reportNodeStatus(localConfig.simCurrentOrderedGraph, Reports.status.frame)
    archiveStatus(localConfig.simCurrentOrderedGraph, Reports.graph, Reports.status.nodes)
    updateChart()
    updateGraphLabels()

    console.log(Reports.graph)
    Reports.json = JSON.stringify(Reports.status, null, 2)
    Reports.status.frame++
    if (!localConfig.simPaused) {
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
                id:element.id,
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
        let debug =true
        if (element.properties.type== "loop") {
            resolveLoops(orderedGraph.orderedNodes, element,orderedGraph.parentsList[element.id], orderedGraph.adgencyList[element.id], frame)
        }
        if (debug) {
            console.debug(frame +"|"+element.name +" => "+ element.properties.value)
            if (element.properties.type == "flux") {
                console.debug(frame +"|"+element.name +" LEFT => "+ element._sim.left)
                console.debug(frame +"|"+element.name +" FLUX => "+ element._sim.flux)
                
            }
        }
    });
    orderedGraph.orderedNodes.forEach(element => {
        if (element.properties.type == "stock") {
            recordStockValueForDelays(orderedGraph.orderedNodes, element,frame)//record the value of all stock to use for other anim frame and update current value
            let debug =true
            if (debug) {
                console.debug(frame +"|S"+element.name +" => "+ element.properties.value)
            }
        }
        
    });
    
}

function resolveFunction(functionText, nodes, node, parents, children, frame) {
    var vars={}
    parents.forEach(element => {
        var parentNode = nodes.find(n=> n.id == element)
        vars[ ""+parentNode.name+""]=parentNode.properties.value
        if (parentNode.properties.type =="event") { //use special prof of events
            vars[ ""+parentNode.name+"_end"]=parentNode._sim.isFinishing
            vars[ ""+parentNode.name+"_ended"]=parentNode._sim.finished
        }
        if (parentNode.properties.type =="flux") { //use special prof of events
            vars[ ""+parentNode.name+"_flux"]=parentNode._sim.flux
            vars[ ""+parentNode.name+"_left"]=parentNode._sim.left//TODO not working
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
        time:Reports.status.frame,
        ifThenElse:function (cond,vthen,velse) {
            if (cond) {
                return vthen           
            }else{return velse}
        }
    }
    console.log(node.id, vars);
    function createFunction1() {
        
        return new Function ("nodes,$","return " + functionText);
    }

    var F=createFunction1()
    var result = F(vars,$)
    return result
}

function executeNodeFunction(nodes, node, parents, children, frame) {
    let nodeValue = undefined
    if (node.properties.type == "variable" || node.properties.type == "flux"|| node.properties.type == "event") {
        if ( node.properties.function != "") {
            nodeValue= resolveFunction(node.properties.function, nodes, node, parents, children, frame)
        }else{
            nodeValue=  node.properties.value
        }
    } 
    if (node.properties.type == "stock") {
        nodeValue=  node.properties.value
    } 
    if (node.properties.type == "table") {
        if (node.properties.function != "" && node.properties.function[0] == "[" ) {
            let dataArray =JSON.parse(node.properties.function)

            if (node.properties.spread >1) {
                let spreadedData =[] 
                for (let i = 0; i < dataArray.length; i++) {
                    const element = dataArray[i];
                    const nextElement = dataArray[i+1]
                    if (nextElement) {
                        let localIncrement = (nextElement-element)/node.properties.spread
                        for (let j = 0; j < node.properties.spread; j++) {
                            spreadedData.push(parseInt(element)+(j*localIncrement))
                        }
                    }
                }
                dataArray = spreadedData
            }
            if (node.properties.round) {
                // let spreadedData =[]
                
                // for (let i = 0; i < dataArray.length; i++) {
                //     var currentIncrementTotal = 0
                //     const element = dataArray[i];
                //     const nextElement = dataArray[i+1]
                //     if (nextElement) {
                //         let localIncrement = (nextElement-element)/node.properties.spread
                //         // localIncrement = Math.round(localIncrement)
                        
                //         for (let j = 0; j < node.properties.spread; j++) {
                //             currentIncrementTotal +=localIncrement
                //             spreadedData.push(  parseInt(element)+(Math.round(j*localIncrement) ) )
                //         }
                //         // spreadedData.push(parseInt(element)+((nextElement-element)-currentIncrementTotal))
                //     }
                // }
                // dataArray = spreadedData
                for (let index = 0; index < dataArray.length; index++) {
                    dataArray[index] = Math.round(dataArray[index]);
                    
                }
            }

            

            nodeValue= dataArray[Reports.status.frame + node.properties.offset] || 0
        }
    }
    
    return nodeValue
}

function resolveLoops(nodes, node, parents, children, frame) {
    let isActive = true //check if event is active or not
    parents.forEach(element => {
        var parentNode = nodes.find(n=> n.id == element)
        if (parentNode.properties.type == "event") { //if parent is an event, check if finished
            if (!parentNode._sim.finished) {
                isActive = false
            }
        }
        if (parentNode.properties.type == "event") { //if parent is a loop trace it
            node._sim.inLoops = Object.assign({}, node._sim.inLoops, parentNode._sim.inLoops)
        }
    });
    if (node.properties.iterations != 0 && node._sim.currentIteration >= node.properties.iterations) {
        isActive = false
    }
    if (isActive && node.properties.condition !="") {
        //check condition
        let cond = resolveFunction(node.properties.condition, nodes, node, parents, children, frame)
        if(!cond){isActive = false }
    }
    if (isActive) {
        node.properties.value =1
        nodes.forEach(element => {
            if (element.properties.type == "event") {
                if (element._sim.inLoops[node.uuid]) {
                    element._sim.elapsed =0; //if element is linked to loop reset it
                    element._sim.finished =0;
                }
            }
            if (element.properties.type == "loop") {
                // if (element._sim.inLoops[node.uuid] && !node._sim.inLoops[element.uuid]) { //don't reset parents
                //     element._sim.currentIteration =0; //if element is linked to loop reset it
                // }
                if (element._sim.inLoops[node.uuid] && nodes.indexOf(element) < nodes.indexOf(node) && node.uuid != parent.uuid ) { //don't reset parents
                    element._sim.currentIteration =0; //if element is linked to loop reset it
                    alert(element.name)
                }
            }
        }); 
        node._sim.currentIteration ++ 
    }else{
        node.properties.value =0
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

            node._sim.flux = fluxValue
            node._sim.left = parentNode.properties.value
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
        if (parentNode.properties.type == "event") { //if parent is a loop trace it
            node._sim.inLoops = Object.assign({}, node._sim.inLoops, parentNode._sim.inLoops)
        }
        if (parentNode.properties.type == "loop") { //if parent is a loop trace it
            node._sim.inLoops[parentNode.uuid] = true
        }
    });
    if (isActive && node.properties.condition !="") {
        //check condition
        let cond = resolveFunction(node.properties.condition, nodes, node, parents, children, frame)
        if(!cond){isActive = false }
    }
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
                spread:0,
                round:false,
                offset:0,
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
                condition:"",
                duration:5,
                observe:true,
                
            }
        }
    )
    update()
}
function addLoopNode() {
    var name = prompt("node name")
    let newId = uuidv4()
    data.nodes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#25847d",
            properties: {
                type:"loop",
                name: name,
                value:1,
                function:"",
                condition:"",
                duration:0,
                condition:"",
                interations:0,
                observe:false,
                
            }
        }
    )
    update()
}

function addNote() {
    var name = prompt("Note")
    let newId = uuidv4()
    data.notes.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#25847d",
            content:name
        }
    )
    update()
}
function addGroup() {
    var name = prompt("Group")
    let newId = uuidv4()
    data.groups.push(
        {
            id:newId,
            uuid:newId,
            x:0,
            y:0,
            name:name,
            customColor:"#25847d",
            content:name
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
function deleteNodes() {
    let selectedNodes = graph.getSelectedNodes()
    if (selectedNodes) {
        selectedNodes.forEach(element => {
            data.nodes = data.nodes.filter(n=>n.uuid != element.uuid)
            data.relationships = data.relationships.filter(r=>r.source != element.uuid).filter(r=>r.target != element.uuid)
        });
        console.log(selectedNodes)
    }
    update()
}
function duplicateNodes() {
    let selectedNodes = graph.getSelectedNodes()
    if (selectedNodes) {
        var idMatrice = {}
        var newNodes =[]
        var newRelations =[]
        selectedNodes.forEach(element => {
            newNodes = newNodes.concat(data.nodes.filter(n=>n.uuid == element.uuid))
            idMatrice[element.uuid] = uuidv4()
            newRelations = newRelations.concat(data.relationships.filter(r=>r.source == element.uuid))
            newRelations = newRelations.concat(data.relationships.filter(r=>r.target != element.uuid))
            // data.nodes = data.nodes.filter(n=>n.uuid != element.uuid)
            // data.relationships = data.relationships.filter(r=>r.source != element.uuid).filter(r=>r.target != element.uuid)
        });
        //DEEPCOPY
        newNodes = JSON.parse(JSON.stringify(newNodes))
        newRelations = JSON.parse(JSON.stringify(newRelations))
        newNodes.forEach(element => {
            element.id = idMatrice[element.id]
            element.uuid = idMatrice[element.uuid]
            element.name = element.name+"_copy"
        });
        newRelations.forEach(element => {
            element.source = idMatrice[element.source] || element.source
            element.target = idMatrice[element.target] || element.target
        });
        console.log(newNodes)
        data.nodes =data.nodes.concat(newNodes)
        data.relationships=data.relationships.concat(newRelations)
    }
    update()
}

function renameNode() {
    if (selectedNode) {
        let node = data.nodes.find(n=>n.uuid == selectedNode)
        var newName = prompt("Update name")
        if (node && newName) {
            node.name = newName
        }
    }
    update()
}

function deleteRelation(uuid) {
    if (uuid) {
        data.relationships = data.relationships.filter(n=>n.id != uuid)
    }
    update()
}
function deleteNote(uuid) {
    if (uuid) {
        data.notes = data.notes.filter(n=>n.id != uuid)
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

// function init(){
//     renderWelcomeScreen(localConfig,loadFromMemory)
// }

function start() {
    data = reloadTree() || data
    updateNodes(data) //for new version
    updateNodesPositionsInData(data)
    console.log(reloadTree() );
    createSimPane();
    render()
    setUpDataGraph()
    renderWelcomeScreen(localConfig,loadFromMemory, deleteRecord, loadNewTemplate)
    
}

function updateNodesPositionsInData(data) {
    console.debug(data);
    if (data.nodesPositions) {
        data.nodesPositions.forEach(f =>{
            var match = data.nodes.find(c => c.uuid == f.uuid)
            if (match) {
              match.fx =f.fx ; match.x =f.fx;
              match.fy=f.fy; match.y =f.fy;
            }
          })
    }
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
        if (f.properties.type == "table") {
            f.properties.spread = f.properties.spread || 0
            f.properties.round = f.properties.round || false
            f.properties.offset = f.properties.offset || 0
        }
        if (f.properties.type == "event") {
            f.properties.condition = f.properties.condition || ""
        }
        if (f.properties.type == "loop") {
            f.properties.condition = f.properties.condition || ""
            f.properties.iterations = f.properties.iterations || 0
        }
      })
}

function update() {
    updateNodesPositions()
    
    saveTree(data)
    //console.log(graph.exportNodesPosition())
    render()
}
function updateNodesPositions() {
    data.nodesPositions = graph.exportNodesPosition()
    data.notes = graph.exportHelpers().notes
    data.groups = graph.exportHelpers().groups
    updateNodesPositionsInData(data)
}
function render(){
    document.querySelector(".graph").innerHTML=""
    graph = new stellae(".graph",{
        onLinkingEnd :async function (e) {
            console.log(e);
            await linkNodes(e[0],e[1])

            console.log("save tree",graph.exportNodesPosition());
            data.nodesPositions = graph.exportNodesPosition()
            update()
          },
          onNodeClick:function (node,eventData) {
            console.log(node,eventData)
            updatePropPane(data.nodes.find(n=>n.uuid == node.uuid))
            selectedNode = node.uuid
            
          },
          onNodeDragEnd:function (node,eventData) {
              console.log("save tree",graph.exportNodesPosition());
            updateNodesPositions()
            saveTree(data)
            //update()
          },
          onHelperDragEnd:function (node,eventData) {
            console.log("save tree",graph.exportNodesPosition());
          updateNodesPositions()
          saveTree(data)
        },
        onRelationshipDoubleClick:function (d) {
            console.log(d)
            var confirmed = confirm("delete"+ d.id)
            if (confirmed) {
                console.log("delte")
                deleteRelation(d.id)
            }
            updateNodesPositions()
            saveTree(data)
        },
        onNoteRemove:function (d) {
            console.log(d)
            deleteNote(d.id)
            saveTree(data)
          
        },
        onSelectionEnd:function (node) {
            graph.setSelectionModeInactive()
        },
        onCanvasZoom:function (e) {//TODO finish implementation
            // console.log(e);
            currentGraphTransformation=e
          },
          startTransform:currentGraphTransformation,
          zoomFit: false
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
        if (element.properties.type == "loop") {
            element.extraLabel = "M502.61 233.32L278.68 9.39c-12.52-12.52-32.83-12.52-45.36 0L9.39 233.32c-12.52 12.53-12.52 32.83 0 45.36l223.93 223.93c12.52 12.53 32.83 12.53 45.36 0l223.93-223.93c12.52-12.53 12.52-32.83 0-45.36zm-100.98 12.56l-84.21 77.73c-5.12 4.73-13.43 1.1-13.43-5.88V264h-96v64c0 4.42-3.58 8-8 8h-32c-4.42 0-8-3.58-8-8v-80c0-17.67 14.33-32 32-32h112v-53.73c0-6.97 8.3-10.61 13.43-5.88l84.21 77.73c3.43 3.17 3.43 8.59 0 11.76z"
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
function recordTree(data, newSpace) {
    if (localStorage.getItem("celestial_archives") === null) {
        localStorage.setItem("celestial_archives", JSON.stringify({saved:{}}))
    }
    if (localStorage.getItem("celestial_archives")) {
        if (!localConfig.currentCelestialArchive || newSpace) {
            let currentData = JSON.parse(window.localStorage.getItem("celestial_archives"))
            currentData.saved[newSpace]= data
            window.localStorage.setItem("celestial_archives", JSON.stringify(currentData));
            localConfig.currentCelestialArchive = newSpace
            
        }else{
            let currentData = JSON.parse(window.localStorage.getItem("celestial_archives"))
            currentData.saved[localConfig.currentCelestialArchive]= data
            window.localStorage.setItem("celestial_archives", JSON.stringify(currentData));
        }
        
    
    }
    
}

function deleteRecord(recordName) {
    let currentData = JSON.parse(window.localStorage.getItem("celestial_archives"))
    delete currentData.saved[recordName]
    window.localStorage.setItem("celestial_archives", JSON.stringify(currentData));
}
function loadOrSaveAs(action) {

    var style = document.createElement('style');
    style.innerHTML = `
    .celestial_select_menu {
        position: fixed;
        top:50%;
        left:50%;
        transform :translate(-50%, -50%);
        width:50%;
        background-color:#26272c;
        padding:20px;
        border-radius: 6px;
    }
    .celestial_button{
        //display:inline-block;
        padding:0.7em 1.4em;
        margin:0 0.3em 0.3em 0;
        border-radius:0.15em;
        box-sizing: border-box;
        text-decoration:none;
        font-family:'Roboto',sans-serif;
        text-transform:uppercase;
        font-weight:400;
        color:#FFFFFF;
        background-color:#089bc3;
        box-shadow:inset 0 -0.6em 0 -0.35em rgba(0,0,0,0.17);
        text-align:center;
        cursor:pointer;
        position:relative;
        }
        .celestial_close_menu{
            color: white;
            font-family: sans-serif;
            position: absolute;
            right: 8px;
            top: 2px;
            cursor:pointer;
        }
    `;
    document.head.appendChild(style);

    let lsData = JSON.parse(window.localStorage.getItem("celestial_archives"));
    let data = lsData.saved

    let adler = createAdler()
    adler.createLens("selectMenu",(p)=>`<div class="celestial_select_menu">${p.menuName}<div class="celestial_close_menu">X</div></div>`)
    adler.createLens("button",(p)=>`<div class="celestial_button button">${p.buttonName}</div>`)

    let supane = adler.addLens("selectMenu",{on:[".celestial_close_menu", "click", ()=> adler.remove()]})
        

    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const element = data[key];
            supane.addLens("button",{
                data:{buttonName:key},
                on:[".button", "click", function (event) {
                    if (action == "load") {
                        console.log("update")
                        localConfig.currentCelestialArchive = key
                        loadFromMemory(element)
                        adler.remove()
                    }
                    if (action == "delete") {
                        console.log("delete")
                        //localConfig.currentCelestialArchive = key
                        if (confirm("Delete "+ key)) {
                            deleteRecord(key) 
                            adler.remove()
                        }
                        
                    }
                }]
                },".celestial_select_menu")
        }
    }
    adler.render()
    //supane.set("menuName", "un menu") 
    
}
function loadFromMemory(newData) {
    data=newData
    updateNodes(data)
    render()
}
function loadNewTemplate() {
    data= {
        nodes:[
            {
                id:id1,
                uuid:id1,
                x:0,
                y:0,
                name:"variable_1",
                customColor:"#f27506",
                properties: {
                    name: "variable_1",
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
                name:"variable_2",
                customColor:"#f27506",
                properties: {
                    name: "variable_2",
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
    updateNodes(data)
    render()
}
function reloadTree() {
    const tree = window.localStorage.getItem('lastTree');
    return JSON.parse(tree)
}
function deleteLocalData() {
    // window.localStorage.clear();
    window.localStorage.removeItem('lastTree');
    location.reload(); 
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

    if (localConfig.chartScale !=1 || localConfig.chartOffset != 0) {
        Reports.status.scaledFrames.push((Reports.status.frame+1)*localConfig.chartScale+localConfig.chartOffset)
        chart.updateOptions({
            xaxis: {
              categories: Reports.status.scaledFrames
            }
          })
    }
    
}

function updateGraphLabels() {

    let labelObject = {}
    graph.clearAllLabels()

    for (const key in Reports.graph) {
        if (Reports.graph.hasOwnProperty.call(Reports.graph, key)) {
            const element = Reports.graph[key];
            if (element.visible) {
                labelObject[element.id]={label:element.data[element.data.length-1]}
            }
        }
    }
    graph.labelNodes(labelObject)
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
