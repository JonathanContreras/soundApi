var express = require("express");
//const jquery = require("jquery");
var app = express();
var path = require("path");
var fs = require("fs");
var mediaserver = require("mediaserver");
var multer = require("multer");

var opcionesMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "canciones"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: opcionesMulter });

var archivoCanciones = path.join(__dirname, "canciones.json");
var indexFile = path.join(__dirname, "index.html");

app.use(express.static("public"));
app.use(
  "/jquery",
  express.static(path.join(__dirname, "node_modules", "jquery", "dist"))
);

app.get("/", function (req, res) {
  res.sendFile(indexFile);
});

app.get("/canciones", function (req, res) {
  fs.readFile(archivoCanciones, "utf8", function (err, canciones) {
    if (err) throw err;
    res.json(JSON.parse(canciones));
  });
});

app.get("/canciones/:nombre", function (req, res) {
  var cancion = path.join(__dirname, "canciones", req.params.nombre);
  console.log(req.params.nombre);
  mediaserver.pipe(req, res, cancion);
});

app.post("/canciones", upload.single("cancion"), function (req, res) {
  var nombre = req.file.originalname;
  fs.readFile(archivoCanciones, "utf8", function (err, archivo) {
    if (err) throw err;
    var canciones = JSON.parse(archivo);
    canciones.push({ nombre: nombre });
    fs.writeFile(archivoCanciones, JSON.stringify(canciones), function (error) {
      if (error) throw error;
      res.sendFile(indexFile);
    });
  });
});

app.listen(3000, function () {
  console.log("App running");
});
