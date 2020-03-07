const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb',{useNewUrlParser : true} , (err) => {
    if(!err){
        console.log('MongoDB Connection is Successful.');
    }
    else{
        console.log('Connection failed :'+err);
    }
});

require('./dictionary.model');