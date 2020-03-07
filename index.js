require('./models/db');

const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const bodyparser = require('body-parser');
const dictionaryController = require('./controllers/dictionaryController');
var upload = require('express-fileupload');
var app = express();

app.use(bodyparser.urlencoded({
    extended:true
}));


app.use(upload());
app.use(bodyparser.json());
app.set('views', path.join(__dirname,'/views/'))
app.engine('hbs',hbs({extname : 'hbs',defaultLayout : 'mainLayout' , layoutsDir : __dirname + '/views/layouts',
helpers :{
    is : function(val1,val2,options){
        if(val1==val2){
            
            return options.fn(this);
        }
        else{
            return options.inverse(this);
        }
    }
}
}));
app.set('view engine','hbs');
app.use(express.static(path.join(__dirname, 'stylesheets')));

app.listen(8000,() => {
    console.log('Express server started at port : 8000');
});

app.use('/',dictionaryController);