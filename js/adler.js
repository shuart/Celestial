function createComponent(name, string){
    var self = {}
    var textString = stringv
    var name = name

    function render(params) {
        return textString
    }
    self.render = render
    return self
}


export function createAdler({
    container = document.body,
    type = "root",
    parent= undefined,
    lenses = {},
    name='root',
    textString ="",
    params={},
    renderAt=undefined,
    wrapperClass="",
  } = {}){
    var self = {}
    console.log(lenses)
    // var lenses = Object.assign({},parentLenses )
    var renderArray = []
    var instances=[]
    var wrapper = createWrapper()
  
    
    function addCSS(cssText){
        var style = document.createElement('style');
        style.innerHTML = cssText;
        document.head.appendChild(style);
    }

    function createLens(name, string, wrapperClass) {
        // lens[name] = createComponent(name, string)
        // let newAdler = createAdler({name:name, textString:string, lenses:lenses})
        //  lenses[name] =newAdler
        // return newAdler

        let newAdler = {name:name, textString:string, lenses:lenses, wrapperClass: wrapperClass}
         lenses[name] =newAdler
        return newAdler

    }
    let inject = (str, obj) => str.replace(/\%{(.*?)}/g, (x,g)=> obj[g]);

    function createWrapper() {
        let wrapper = document.createElement("div")
        if (wrapperClass != "") {
            wrapper.classList += ('adler_panel '+wrapperClass)
        }else{
            wrapper.classList ="adler_panel"
        }
        return wrapper

    }

    function lens(lensName) {
        return lenses[lensName]
    }
    function addLens(lensName,params, renderAt) {
        let newElement = createAdler({name:lenses[lensName].name, textString:lenses[lensName].textString, lenses:lenses[lensName].lenses, container:wrapper, params:params, renderAt:renderAt, wrapperClass:lenses[lensName].wrapperClass})
        var toRender = {
            lens:newElement,
            params:params,
            renderAt:renderAt,
        }
        renderArray.push(toRender)
        return newElement
    }
    function render() {
        
        
        var textToDisplay =textString
        console.log(typeof textString, params.data )
        if(typeof textString === 'function'){
            let props = params.data || {}
            textToDisplay = textString(props)
        }else if (params.data) {
            textToDisplay = inject(textString,params.data)
        }
        wrapper.innerHTML = textToDisplay
        if (wrapper.childElementCount==1) {
            wrapper = wrapper.firstElementChild; 
            console.log(wrapper)
        }
        // if (name != "root") {
        //     if (renderAt) {
        //         container.querySelector(renderAt).appendChild(wrapper)
        //     }else{
        //         container.appendChild(wrapper)
        //     }
            
        // }
        console.log(wrapper.innerHTML)
        for (let index = 0; index < renderArray.length; index++) {
            const element = renderArray[index];
            element.lens.render()
            console.log(params)
            
        }
        if (params && params.on) {
            console.log(params.on)
            if ( Array.isArray(params.on[0]) ) {
                for (let index = 0; index < params.on.length; index++) {
                    const action = params.on[index];
                    let target = wrapper.querySelector(action[0])
                    if (target) {
                        target.addEventListener(action[1],action[2])
                    }
                }
            }else{
                const action = params.on;
                    let target = wrapper.querySelector(action[0])
                    if (target) {
                        // var callback = function (wrapper) {
                            
                        // }
                        target.addEventListener(action[1],action[2])
                    }
            }
            
        }   
        
        if (renderAt) {
            container.querySelector(renderAt).appendChild(wrapper)
        }else{
            container.appendChild(wrapper)
        }
        return wrapper
    }

    function remove() {
        wrapper.remove()
    }

    function set(param, value) {
        if (params) {
            params[param] = value
        }
        render()
    }

    self.render = render
    self.set = set
    self.remove = remove

    self.addCSS = addCSS
    self.addLens = addLens
    self.createLens = createLens
    return self
}