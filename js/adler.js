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
    textString =""
  } = {}){
    var self = {}
    console.log(lenses)
    // var lenses = Object.assign({},parentLenses )
    var renderArray = []
    var instances=[]
    var wrapper = createWrapper()
    

    function createLens(name, string) {
        // lens[name] = createComponent(name, string)
        // let newAdler = createAdler({name:name, textString:string, lenses:lenses})
        //  lenses[name] =newAdler
        // return newAdler

        let newAdler = {name:name, textString:string, lenses:lenses}
         lenses[name] =newAdler
        return newAdler

    }
    let inject = (str, obj) => str.replace(/\%{(.*?)}/g, (x,g)=> obj[g]);

    function createWrapper() {
        let wrapper = document.createElement("div")
        wrapper.classList ="adler panel"
        return wrapper

    }

    function lens(lensName) {
        return lenses[lensName]
    }
    function addLens(lensName,params, renderAt) {
        let newElement = createAdler({name:lenses[lensName].name, textString:lenses[lensName].textString, lenses:lenses[lensName].lenses, container:wrapper})
        var toRender = {
            lens:newElement,
            params:params,
            renderAt:renderAt,
        }
        renderArray.push(toRender)
        return newElement
    }
    function render(params) {
        

        var textToDisplay =textString
        if (params) {
            textToDisplay = inject(textString,params)
        }
        wrapper.innerHTML = textToDisplay
        console.log(wrapper.innerHTML)
        for (let index = 0; index < renderArray.length; index++) {
            const element = renderArray[index];
            if (!element.renderAt) {
                wrapper.appendChild(element.lens.render(element.params))
            }else{
                console.log(element.renderAt)
                console.log(element.params)
                wrapper.querySelector(element.renderAt).appendChild(element.lens.render(element.params))
            }
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
        
        if (name == "root") {
            container.appendChild(wrapper)
        }
        return wrapper
    }

    function remove() {
        wrapper.remove()
    }

    self.render = render
    self.remove = remove

    self.addLens = addLens
    self.createLens = createLens
    return self
}