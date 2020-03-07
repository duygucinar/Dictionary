const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const myModel = mongoose.model('myModel');
const fs = require('fs');
const path = require('path');
mongoose.set('useFindAndModify',false);

var data_id;

/*--- HOME PAGE ---*/
router.get('/',(req,res) => {
    /*--- Search --- */
    if(req.query.search==null){ 
        myModel.find((err,docs) => {
            if(!err){
                res.render('dictionary/read', {
                    items : docs
                });
            }
            else{
                console.log('Liste Yüklenirken Hata Oluştu !');
            }
        });
    }
    else{
        var search = req.query.search;
        myModel.find({"data.word" : new RegExp(search,'i')}, (err,doc) => {
           if(!err){
            res.render('dictionary/read', {
                items : doc,
                s_value : search,
                filter : req.query.lang
            });
           }
       });
    }
    
});

/*--- EXPORTING RECORDS --- */
router.get('/export', (req,res) => {
    var root = path.dirname(require.main.filename);
    var downloadsDir = root + '/downloads/data.json';
    
    /*--- Deleting all records ---*/
    fs.writeFile(downloadsDir,'',(err) => {
        if(err){
            console.log(err);
        }
    });

    /*--- Writing all records --- */
    myModel.find((err,docs) => {
        if(!err){
           for(var i = 0; i<docs.length ;i++){
                var item;
                if(i==docs.length-1){
                    item = JSON.stringify(docs[i]);
                }
                else{
                    item = JSON.stringify(docs[i])+'\n';
                }
                fs.appendFile(downloadsDir,item,(errors) => {
                    if(errors){
                        console.log(errors);
                    }
                    else{
                        res.download(downloadsDir);
                    }
                });
           }
        }
        else{
            console.log('Error :'+err);
        }
    });
});

/*--- INSERT PAGE ---*/
router.get('/add', (req,res) => {
        res.render('dictionary/add',{title : "INSERT"});
});

/*--- INSERTING RECORD ---*/
router.post('/add', (req,res) => {
    var items = body_parsing(req);
    /*--- Checking same languages --- */
    if(items=='langError'){
        res.render('dictionary/error',{message : 'Language fields must be different!'});
    }
    /*--- Checking items length --- */
    else if(items.length>1){
        myModel.db.collection("sozluk").insertOne({"data":items}, (err) => {
            if(!err){
                res.redirect('/');
            }
            else{
                console.log('Hata :'+err);
            }
        });
    }
    else{
        res.render('dictionary/error',{message : 'Least 2 fields are required!'});
    }
});

/*--- IMPORTING RECORDS --- */
router.post('/add/import', (req,res) => {
    /*--- Checking file exits--- */
    if(req.files){
        var file = req.files.file.data.toString();
        var array = file.split('\n');
        for(i in array){
            /*--- Importing without _id */
            myModel.db.collection("sozluk").insertOne({"data":JSON.parse(array[i])}, (err) => {
                if(err){
                    console.log('Hata :'+err);
                }
            });
            
            /*--- Importing with _id */
            /*myModel.db.collection('sozluk').insertOne(JSON.parse(array[i]), (err) => {
                if(err){
                    console.log('Hata :'+err);
                }
            });*/
        }
        res.redirect('/');
    }
    else{
        res.render('dictionary/error',{message : "File doesn't exits"});
    }
});

/*--- UPDATE PAGE --- */
router.get('/:id', (req,res) => {
    myModel.findById(req.params.id, (err,doc) => {
        if(!err){
            res.render('dictionary/edit', {
                title : 'UPDATE',
                items : doc.data
            });
            data_id=req.params.id;
        }
    });
    
});

/*--- UPDATING RECORD --- */
router.post('/:id', (req,res) => {
    var items = body_parsing(req);
    /*--- Checking same languages --- */
    if(items=='langError'){
        res.render('dictionary/error',{message : 'Language fields must be different!'});
    }
    /*--- Checking items length --- */
    else if(items.length>1){
        myModel.findByIdAndUpdate(data_id,{$set :{"data" : items}},{upsert : true}, (err,doc) => {
            if(!err){
                res.redirect('/');
            }
            else{
                console.log('Hata :'+err);
            }
        });
    }
    else{
        res.render('dictionary/error',{message : 'Least 2 fields are required!'});
    }
});

/*--- DELETING RECORD ---*/
router.get('/delete/:id',(req,res) => {
    myModel.findByIdAndDelete(req.params.id, (err,doc) => {
        if(!err){
            res.redirect('/');
        }
        else{
            console.log('Hata :'+err);
        }
    });
});

/*GETTING FIELDS FROM REQ */
function body_parsing(req){
    var items = [];
    var i=0;
    /*--- JSON --- */
    var temp = {
        lang : String,
        word : String
    }
   /*--- Inserting fields to JSON --- */
    for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            i++;
            if(i%2==1){
                temp.lang=req.body[key];
            }
            else{
                temp.word=req.body[key];
                if(temp.word!="" && temp.lang!=""){
                    items.push(temp);
                }
                var temp = {
                    lang : String,
                    word : String
                }
            }            
        }
    }
    /*--- Checking same fields */
    for(var i = 0;i<items.length;i++){
        for(var j = i+1;j<items.length;j++){
            if(items[i].lang==items[j].lang){
                return 'langError';
            }
        }
    }

    return items;
}


module.exports = router;