const mongoose = require('mongoose');

var mySchema = new mongoose.Schema({
    data : [
        {
            _id : false,
            lang : {type :String, required:true},
            word : {type :String, required:true}
        }
    ]
},{collection:'sozluk'});


var myModel = mongoose.model('myModel',mySchema);
module.exports =myModel;