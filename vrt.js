const express = require('express')
const app = express()
const resemble = require('resemblejs');
const fs = require("mz/fs");
const cypress = require('cypress')

var archivoHistorico = "./ejecuciones.json"
const PORT = 80//process.env.PORT || 5000

app.use(express.static('public'));
app.set('view engine', 'ejs')
app.get('/', function (req, res) {    
    var contenido = fs.readFileSync(archivoHistorico)
    var historico = JSON.parse(contenido)
    res.render('index', historico)
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

app.get('/comparar', function (req, res) {
    var cypressScript = 'cypress/integration/simple_spec.js'

    cypress.run({
        spec: cypressScript
    })
        .then((results) => {
            var baseArchivos = './cypress/screenshots/simple_spec.js/'
            var imagenInicio = baseArchivos + 'gen-paleta-1.png'
            var imagenFin = baseArchivos + 'gen-paleta-2.png'
            var carpetaDestino = './public/imagenes/'

            var fecha = new Date().toISOString().replace('T', ' ').substr(0, 19)
            var carpeta = fecha.replace(" ", "-").replace(new RegExp(":", "g"), "-")
            fs.mkdirSync(carpetaDestino + carpeta);

            fs.copyFileSync(imagenInicio, carpetaDestino + carpeta + '/screen1.png');
            fs.copyFileSync(imagenFin, carpetaDestino + carpeta + '/screen2.png');

            resemble(carpetaDestino + carpeta + '/screen1.png').compareTo(carpetaDestino + carpeta + '/screen2.png').ignoreLess()
                .outputSettings({
                    boundingBox: {
                        left: 100,
                        top: 200,
                        right: 200,
                        bottom: 600
                    }
                }).onComplete(function (data) {
                    var json = JSON.stringify(data);
                    fs.writeFile(carpetaDestino + carpeta + '/data.json', json);
                    fs.writeFile(carpetaDestino + carpeta + '/output.png', data.getBuffer());

                    var ejecucion = { fecha: fecha, carpeta: carpeta, info: JSON.parse(json)}

                    var contenido = fs.readFileSync(archivoHistorico)
                    var historico = JSON.parse(contenido)
                    historico.ejecuciones.push(ejecucion)
                    fs.writeFile(archivoHistorico, JSON.stringify(historico))

                    res.render('index', historico)
                });
        })
        .catch((err) => {
            console.error(err)
        })
})