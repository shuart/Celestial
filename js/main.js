
import { stellae } from "./vendor/stellae2.js";
import tweakpane from 'https://cdn.skypack.dev/tweakpane';
//const pane = new tweakpane.Pane();
console.log(stellae)

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

        var vars={test:"testdd"}

        function createFunction1() {
            
            return new Function ("nodes","return " + PARAMS.function);
        }

        var F=createFunction1()
        var result = F(vars)
        alert(result)
        console.log(data)
        //return(F());
      });
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
