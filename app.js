const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Connecting to the todolistDB

mongoose.connect("mongodb+srv://ashmi-admin:<password>@cluster0.y5yga2r.mongodb.net/todolistDB");

//Creating Schema
const itemSchema  = mongoose.Schema({
  name: String
});

const listSchema = {
  name: String,
  items: [itemSchema]
};

//Creating Model
const newItem = mongoose.model("listItem", itemSchema);
const List = mongoose.model("List", listSchema);

//default items
const item1 = new newItem({
  name: "Welcome to your todolist!"
});

const item2 = new newItem({
  name: "Hit the + button to add a new item."
});

const item3 = new newItem({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1 , item2 , item3];

app.get("/" , function(req ,res){

  //fetching list data from todolist database
   newItem.find(function(err,listitems)
   {
        if(listitems.length === 0)
        {
          newItem.insertMany(defaultItems,function(err){
            if(!err){
              console.log("Default items inserted successfully");
            }
          });
          res.redirect("/");
        } else {
          res.render("list" , {listTitle:"Today" , newListItem:listitems});
        }
    });
});

app.post("/" , function(req , res)
{
    let listname = req.body.list;
    let itemname = req.body.newItem;

    item = new newItem({ name:itemname });

    if(listname === "Today")
    {
      item.save();
      res.redirect("/");
    }
    else
    {
      List.findOne({name: listname} , function(err, foundlist){
        foundlist.items.push(item);
        foundlist.save();
      });
      res.redirect("/"+listname);
    }
 });

app.get("/:customListName", function(req , res){

  const customlistname = _.capitalize(req.params.customListName);
  List.findOne({name:customlistname} , function(err, customlist){
    if(!err)
    {
      if(!customlist)
      {
          const list = new List({
            name: customlistname,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customlistname);
      }
      else
      {
        res.render("list", {listTitle: customlist.name , newListItem: customlist.items});
      }
    }
  });
});

app.post("/delete", function(req , res){
  const deleteItemid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    newItem.deleteMany({ _id: deleteItemid }, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Item deleted successfully from home list!!");
      }
    });
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName} , {$pull : {items : {_id: deleteItemid }}} , function(err , foundlist){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is up and running!!");
});
