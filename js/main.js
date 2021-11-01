
import { stellae } from "./vendor/stellae2.js";
import tweakpane from 'https://cdn.skypack.dev/tweakpane';

import { v4 as uuidv4 } from  'https://cdn.skypack.dev/uuid';

//const pane = new tweakpane.Pane();
console.log(stellae)

var Reports = {
    status:{
        frame:0,
        nodes:{}
    },
    json:""
}

var currentPropPane  = undefined
var data = {
    nodes:[
        {
            id:"1",
            uuid:"1",
            x:0,
            y:0,
            name:"test",
            properties: {
                name: "test",
                value:5,
                function:"",
            }
        },
        {
            id:"2",
            uuid:"2",
            x:10,
            y:10,
            name:"tesst",
            properties: {
                name: "tesst",
                value:15,
                function:"",
            }
        }
    ],
    relationships:[],
    notes:[],
    groups:[]
}

render()

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
    currentPropPane.addInput(PARAMS, 'name');
    currentPropPane.addInput(PARAMS, 'value');
    currentPropPane.addInput(PARAMS, 'function');

    currentPropPane.addMonitor(Reports   , 'json', {
        multiline: true,
        lineCount: 5,
      });

    const btn = currentPropPane.addButton({
        title: 'execute',
        label: 'counter',   // optional
      });

    
      
    let count = 0;
    btn.on('click', () => {
        count += 1;
        console.log(count);

        //var theInstructions = "alert('Hello World'); var x = 100";
        var theInstructions = "return " + "15*8";

        

        function createFunction1() {
            
            return new Function ("nodes","return " + PARAMS.function);
        }

        var F=createFunction1()
        var result = F(vars)
        alert(result)
        console.log(data)
        //return(F());
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

    const btnSimulate = currentPropPane.addButton({
        title: 'Simulate',
        label: 'counter',   // optional
    });
    btnSimulate.on('click', () => {
        startSimulation()
    });

    
}

function startSimulation() {
    var speed =1000
    Reports.status.frame =0 
    
    step()
    
    function step() {
        console.log(Reports.status.frame)
        Reports.status.frame++
        Reports.status.nodes = reportNodeStatus()
        Reports.json = JSON.stringify(Reports.status, null, 2)
        setTimeout(step, speed)
        
    }
    
}

function reportNodeStatus() {
    resolveNodes()
    var dataContainer = {}
    data.nodes.forEach(element => {
        dataContainer[element.id] = element.properties.value 
    });
    return dataContainer
}

function resolveNodes() {
    data.nodes.forEach(element => {
        element.properties.value = executeNodeFunction(element)
    });
}

function executeNodeFunction(node) {
    if ( node.properties.function != "") {
        var vars={test:"testdd"}
        var $={
            time:Reports.status.frame
        }
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

function addVariableNode() {
    var name = prompt("node name")
    data.nodes.push(
        {
            id:uuidv4(),
            uuid:"1",
            x:0,
            y:0,
            name:name,
            customColor:"#f27506",
            properties: {
                type:"variable",
                name: name,
                value:5,
                function:"",
            }
        }
    )
    render()
}



// function update(){
//     //graph.cleanAll()
//     graph.updateWithD3Data(data)
// }

async function linkNodes(node1, node2){
    //data.nodes = []
    data.relationships.push(
        {
            id:'efesfsefes',
            startNode:node1.id,
            endNode:node2.id,
            source:node1.id,
            target:node2.id
        }
    )
    
}


function render(){
    document.querySelector(".graph").innerHTML=""
    var graph = new stellae(".graph",{
        onLinkingEnd :async function (e) {
            console.log(e);
            await linkNodes(e[0],e[1])
            render()
          },
          onNodeClick:function (node,eventData) {
            console.log(node,eventData)
            updatePropPane(node)
            
          },
    })
    graph.updateWithD3Data(data)
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
