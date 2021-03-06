import { createAdler } from "./adler.js";

export function renderWelcomeScreen(localConfig, loadElementCallback,deleteRecord, loadNewTemplate){
    let adler = createAdler()
    adler.addCSS(`
        .welcomeArea{
        z-index: 999999999;
        width:100%;
        height:100%;
        background-color:white;
        position: fixed;
        }
    `)
    adler.createLens("welcomeContainer",(d)=>`
        <div class="welcomeArea">
            <div class="container is-widescreen">
                <section class="hero is-warning ">
                    <div class="hero-body">
                    <p class="title">
                        ${d.title}
                    </p>
                    <p class="subtitle">
                        System Dynamics & discreet events simulator
                    </p>
                    </div>
                </section>
                <div class="block"></div>
                <section>
                 <button class="button is-primary  action_new">New Graph</button>
                 <button class="button  action_last">Last session</button>
                </section>
                <div class="block"></div>
                <div class="block"></div>
                <section>
                    <p class="title">
                        Saved Graphs
                    </p>
                    <div class="columns is-multiline is-desktop load_area">
                    
                    </div>
                </section>


            </div>
        </div>`
    )
    adler.createLens("card",(p)=>`
    <div class="column">
        <div class="card">
            <div class="card-content">
                <p class="subtitle">
                    ${p.name}
                </p>

            </div>
            <footer class="card-footer">
                <p class="card-footer-item action_load">
                    <button class="button">Load</button>
                </p>
                <p class="card-footer-item action_delete">
                    <button class="button">Delete</button>
                </p>
            </footer>
            </div>
        </div>
    </div>
    
    `)

    let supane = adler.addLens("welcomeContainer",{
        data:{title:"Celestial"},
        on:[
            [".action_new", "click", ()=>{
                localConfig.currentCelestialArchive = ""; 
                loadNewTemplate()
                adler.remove()} 
            ],
            [".action_last", "click", ()=>{
                adler.remove()} 
            ]
        ],
        
    })

    function generateCardArray(params) {
        let lsData = JSON.parse(window.localStorage.getItem("celestial_archives"));
        if (!lsData) {
            lsData = {saved:{}}
        }
        let data = lsData.saved
        let arrayData = []
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element = data[key];
                arrayData.push({
                    name : key,
                    element : element
                })
      
            }
        }
        return arrayData
    }

    // let lsData = JSON.parse(window.localStorage.getItem("celestial_archives"));
    // if (!lsData) {
    //     lsData = {saved:{}}
    // }
    // let data = lsData.saved
    // let arrayData = []
    // for (const key in data) {
    //     if (Object.hasOwnProperty.call(data, key)) {
    //         const element = data[key];
    //         arrayData.push({
    //             name : key,
    //             element : element
    //         })
  
    //     }
    // }

    let card = adler.addLens("card",{
        // data:{name:key}, 
        data:{name:"key"}, 
        for:generateCardArray,
        on:[
            [".action_load", "click", (e, p)=>{
            localConfig.currentCelestialArchive = p.name; 
            loadElementCallback(p.element); 
            adler.remove()} ],
            [".action_delete", "click", (e,p)=>{
                // localConfig.currentCelestialArchive = key; 
                if (confirm("Delete this element")) {
                    deleteRecord(p.name); 
                    adler.remove()
                    adler.render()
                    // location.reload(); 
                }
                
            } ]
        ],
    }, ".load_area")


    // for (const key in data) {
    //     if (Object.hasOwnProperty.call(data, key)) {
    //         const element = data[key];
    //         let card = adler.addLens("card",{
    //             data:{name:key}, 
    //             on:[
    //                 [".action_load", "click", ()=>{
    //                 localConfig.currentCelestialArchive = key; 
    //                 loadElementCallback(element); 
    //                 adler.remove()} ],
    //                 [".action_delete", "click", ()=>{
    //                     localConfig.currentCelestialArchive = key; 
    //                     if (confirm("Delete this element")) {
    //                         deleteRecord(key); 
    //                         adler.remove()
    //                         adler.render()
    //                         location.reload(); 
    //                     }
                        
    //                     } ]
                    
                
    //                 ],
    //             }, ".load_area")
    //         // supane.addLens("button",{
    //         //     buttonName:key,
    //         //     on:[".button", "click", function (event) {
    //         //         if (action == "load") {
    //         //             console.log("update")
    //         //             localConfig.currentCelestialArchive = key
    //         //             loadFromMemory(element)
    //         //             adler.remove()
    //         //         }
    //         //         if (action == "delete") {
    //         //             console.log("delete")
    //         //             //localConfig.currentCelestialArchive = key
    //         //             if (confirm("Delete "+ key)) {
    //         //                 deleteRecord(key) 
    //         //                 adler.remove()
    //         //             }
                        
    //         //         }
    //         //     }]
    //         //     },".celestial_select_menu")
    //     }
    // }

    // let card = adler.addLens("card",{on:[".card", "click", ()=> adler.remove()]}, ".load_area")
    // let card2 = adler.addLens("card",{on:[".card", "click", ()=> adler.remove()]}, ".load_area")

    adler.render()
}