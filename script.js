
class MenuItem{  // this one is for one pizza row in menu
    constructor(elementsObject) {
        this.elementsObject = elementsObject 
        this.elementsObject["Delete"] = "Delete" // adding one more element to create a cell for it automatically below
    }
    
    getTableRowNode() {

        this.tableRowNode = document.createElement("tr")
        Object.keys(this.elementsObject).forEach(key => {
            if (key!="heat") {  // for all elements except heat, as it wont have its column
                this.tdNode = document.createElement("td")
            }

            switch (key) { 
                case "pname": 
                    this.tdNode.innerHTML = this.elementsObject[key];
                    for (let index = 1; index <= this.elementsObject["heat"]; index++) { // second key in elementsObject array is heat int.
                        this.imgNode = document.createElement("img")
                        this.imgNode.src="img/chili.svg"
                        this.imgNode.setAttribute("class","chili")
                        this.tdNode.appendChild(this.imgNode)
                    }
                    break;
                case "heat": 
                    // we do not need a cell for heat
                    break;

                case "photo": 
                    this.imgNode = document.createElement("img")
                    this.imgNode.src = this.elementsObject[key]
                    this.tdNode.appendChild(this.imgNode)
                    break;

                case "Delete": 
                    this.buttonNode = document.createElement("button")
                    this.buttonNode.textContent = this.elementsObject[key]
                    this.buttonNode.setAttribute("onclick",`View.removePizza("${this.elementsObject["pname"]}")` ) // add pizza name as parameter
                    this.tdNode.appendChild(this.buttonNode)
                    break;
            
                default:// Price, Toppings
                    this.tdNode.innerHTML = this.elementsObject[key];
                    break;
            }
            
            this.tableRowNode.appendChild(this.tdNode)
        });

    return this.tableRowNode   
    }

}

class View{

    static tableNode = document.getElementById("table")

    static loadMenuAfterPageReload(){
        if (sessionStorage.length >=1) {  // true means session is not empty, after page reload
            this.createTable()
            this.loadMenu()
        } 
    }

    static nameErrorValue(message){
        this.pnameErrNode = document.getElementById("pname-err")
        this.pnameErrNode.innerHTML = message
    }


    static resetInputs(){

        this.inputs = document.getElementsByTagName("input");
        for (let index = 0; index < this.inputs.length; index++) {
            const inputNode = this.inputs[index];
            inputNode.value = "";
        }
        this.nameErrorValue(""); // clear error message if it exists
    }

    static loadMenu(sortingParameter){
 
        this.unsortedPizzasArray= []
        Object.keys(sessionStorage).forEach(key => {    
            this.onePizzaArray = JSON.parse(sessionStorage[key]);
            this.unsortedPizzasArray.push(this.onePizzaArray)
        });

        this.sortedPizzasArray = Model.sort(sortingParameter,this.unsortedPizzasArray)

        Object.keys(this.sortedPizzasArray).forEach(key => {

            this.menuItemClass = new MenuItem(this.sortedPizzasArray[key]); 
            this.tableNode.appendChild(this.menuItemClass.getTableRowNode());
        });


    }

    static updateMenu(sortingParameter){
        // remove all old divs:
        while (this.tableNode.firstChild) {
            this.tableNode.removeChild(this.tableNode.firstChild);
        }
        //load again from session
        this.createTable();
        this.loadMenu(sortingParameter);
    }

    static createTable(){

        this.tableHeader = document.createElement("tr");
        this.headers = ["Pizza Name","Price","Toppings","Image", "Remove"]
        this.headers.forEach(element => {
            this.tableHeaderCell = document.createElement("th");
            this.tableHeaderCellAnc = document.createElement("a");
            this.tableHeaderCellAnc.innerText = element;
            this.tableHeaderCell.appendChild(this.tableHeaderCellAnc)

            if(element=="Price"||element=="Pizza Name"){
                this.tableHeaderCellAnc.setAttribute("href",`javascript:View.updateMenu("${element}")` ) // to sort by given element name
            }
            if(element=="Pizza Name"){ // have to add "/heat" to same header cell, to be able to sort by heat 
                this.tableHeaderCellHeatAnc = document.createElement("a");
                this.tableHeaderCellHeatAnc.innerText = "/Heat"
                this.tableHeaderCellHeatAnc.setAttribute("href",`javascript:View.updateMenu("Heat")` ) // to sort by Heat
                
                this.tableHeaderCell.appendChild(this.tableHeaderCellHeatAnc)
            }
            this.tableHeader.appendChild(this.tableHeaderCell)
            
        });
        this.tableNode.appendChild(this.tableHeader)      
    };

    static removePizza(pizzaName){
        var confirm = window.confirm("Do you really want to delete this pizza?");
        if (confirm) {
        sessionStorage.removeItem(pizzaName);
        this.updateMenu() 
        } 
    }

}



class Model{

    static validate(pname){
        
        this.validatedObject = {};
        
        // this.pname =  document.getElementById("pname").value,
        this.price =    document.getElementById("price").value,
        this.heat =    document.getElementById("heat").value,
        this.toppings = document.getElementById("toppings").value,
        this.photo =    document.getElementById("photo").value
        
        if (sessionStorage.getItem(pname)) { // this one is responsible for unique name
            return false;
        } 
        // proper validation can be done there for each element
        this.validatedObject["pname"] = pname
        this.validatedObject["price"] = this.price
        this.validatedObject["heat"] = this.heat||0 // by default heat will be 0 level. 

        //For toppings, we have to find spaces, delete them and replace them by commas
        this.toppings = this.toppings.replace(/,+\s+/g,","); //if there is one comma with spaces after it, we delete spaces
        this.toppings = this.toppings.replace(/(\s+)/g,","); //one or multiple space has to be changed to comma
        this.validatedObject["toppings"] = this.toppings.split(",");

        switch (this.photo) {
            case "American":
            this.validatedObject["photo"] = "img/american.jpg"
                break;

            case "Domino":
            this.validatedObject["photo"] = "img/domino.jpg"
                break;

            case "Florentine":
            this.validatedObject["photo"] = "img/florentine.jpg"
                break;

            case "Mexico":
            this.validatedObject["photo"] = "img/mexico.jpg"
                break;

            case "Onions":
            this.validatedObject["photo"] = "img/onions.jpg"
                break;
        
            default:
                this.validatedObject["photo"] = "img/no.png"
                break;
        } 
        return this.validatedObject;
    }

    static saveToSession(pname,data){
        sessionStorage.setItem(pname, JSON.stringify(data)); // we save current pizza name as key and all other data as object. that allows fast name lookup
    }

    static sort(sortingParameter="Pizza name",arrayToSort){
        switch (sortingParameter) { 
            case "Pizza name":
                arrayToSort.sort((a, b) => {
                    return a["pname"] - b["pname"];
                }); 
                break;
            
            case "Heat":
                arrayToSort.sort((a, b) => {
                    return a["heat"] - b["heat"];
                }); 
                break;

            case "Price":
                arrayToSort.sort((a, b) => {
                    return a["price"] - b["price"];
                }); 
                break;
        }
        return arrayToSort
    }

}



class Controller{

    static atStartup(){
        View.loadMenuAfterPageReload()
    }

    static runAddPizza(){
    
        var pname = document.getElementById("pname").value
        var validatedData = Model.validate(pname);//returns false if the pname already exists in Session 
        if (!validatedData) { // if session contains such pizza name as key
            View.nameErrorValue(`Such "${pname}" pizza name already exists!`);
            return;
        } 
            View.resetInputs();
            Model.saveToSession(pname,validatedData);
            View.updateMenu();
    }
}


Controller.atStartup()
