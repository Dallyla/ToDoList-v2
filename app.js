const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();


app.use(bodyParser.urlencoded({extended: true})); //activates body-parser

app.use(express.static("public"));

app.set('view engine', 'ejs'); //diz ao app para usar o ejs como view engine com o express

//create a new mongoDB
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

//Item Model
const Item = mongoose.model('Item', {name: String});

//lists Model
const List = mongoose.model('List', {
    name: String,
    items: [Item.schema]
})


//Create default items to populate the items DB collection 

const item1 = new Item({name: "Welcome to your todoList."});
const item2 = new Item({name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];


//Root route
app.get("/", function(req, res){ 
    
    //Retrieve items from DB
    Item.find({}, function(err, foundItems){

        //Insert default items to DB if foundItems is empty
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Items were succesfully added to the DB");
                }
            });
            res.redirect("/"); // redireciona para a root route novamente que vai refazer a busca no banco

        } else { //If it's not empty then render the content in the home page 
            res.render("list", {
                listTitle: "Today",
                newListItems : foundItems
            }); //passing the day value to ejs file and rendering the response to the browser
        }
        
    });     
});

// custom routes

app.get("/:customListName", function(req, res){
   const customListName = req.params.customListName;    

    //verify if a route document already exists in the DB
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();

                res.redirect("/"+ customListName);

            } else {
                //show an existing list
                res.render("list",{
                    listTitle: foundList.name,
                    newListItems : foundList.items
                });
            }
        }
    });


});


//rota de adição dos posts
app.post("/", function(req,res) { 

    const itemName = req.body.newItem;  //grab the value of newItem
    const listName = req.body.list;     // grab the list title
    
    const item = new Item({name: itemName});

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    

    
});

//rota de deleção dos posts
app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(err){
            console.log(err);
        }else {
            console.log("Item removed.")
        }
    })
    res.redirect("/");
});



//about route

app.get("/about", function(req,res) {
    res.render("about");
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});