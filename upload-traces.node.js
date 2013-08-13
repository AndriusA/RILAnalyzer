var express = require("express"),                                                                
    app = express();                                                                             

// tell express to use the bodyParser middleware                                                 
// and set upload directory                                                                      
app.use(express.bodyParser({ keepExtensions: true, uploadDir: "upload" }));                     
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');
app.set('views', __dirname);
app.use(express.methodOverride());
app.use(app.router);

app.post("/upload", function (request, response) {                                               
    // request.files will contain the uploaded file(s),                                          
    // keyed by the input name (in this case, "file")                                            

    // show the uploaded file name
    console.log("body", request.body)
    console.log("RilLog name", request.files.rilLog.name);
    console.log("RilLog path", request.files.rilLog.path);

    console.log("NetLog name", request.files.netLog.name);
    console.log("NetLog path", request.files.netLog.path);
    
    response.end("upload complete");
});                                                                                              

// render file upload form                                                                       
app.get("/upload-traces", function (request, response) {                                                      
    response.render("upload_form", {}, function(err, html) {
    });                                                         
});                                                                                              

app.listen(3000);