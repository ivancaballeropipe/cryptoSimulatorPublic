'use strict'

// Require
var mysql = require('mysql');
var app = require('./app');
const axios = require('axios');


var nodemailer = require('nodemailer');

// PUERTOS
const PORT = 3000;

// TOKEN
var token = "I1bB8MFuQCDLp4NX0p";

// SERVIDOR
var server = require('http').Server(app); 

// CORS y SOCKETS
const io = require("socket.io")(server , {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: false
    }
});

// Variable global donde se guardan las estadisticas
var global_estadisticas = [];
var global_monedas= [];
var global_precios= {};

// CONEXIÓN CON LOS SOCKETS
io.on('connection', function (socket){
    console.log("Usuario conectado");
})


// CONEXION A LA BASE DE DATOS
var connexion = mysql.createConnection({
    host: "localhost",
    user: "root",
	password: "",
	database: "prueba"
});


connexion.connect(function(err) {
    if (err) {
        throw err;
    } else {
        // SERVIDOR
        server.listen(PORT, function() {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            cargarEstadisticas();
            setInterval(cargarEstadisticas, 30000);
            
        });
    }    
});

function cargarEstadisticas(){
    console.log("InicioSocket");
    conexion(` SELECT * FROM monedas `, function(array_monedas){
        global_monedas = array_monedas;
        getEstadisticas(array_monedas);  
    });
}

// FUNCIONES
async function getEstadisticas(array_monedas){
    
    // Recorremos las monedas
    var datos = [];
    for (let pos = 0; pos < array_monedas.length; pos++) {
        //console.log("-"+array_monedas[pos]['nombre']);
        datos.push(getDatosCoin(array_monedas[pos]['cod_moneda'], '1', array_monedas[pos]['nombre'], array_monedas[pos]['decimales']));
        datos.push(getDatosCoin(array_monedas[pos]['cod_moneda'], '7', array_monedas[pos]['nombre'], array_monedas[pos]['decimales']));
        datos.push(getDatosCoin(array_monedas[pos]['cod_moneda'], '30', array_monedas[pos]['nombre'], array_monedas[pos]['decimales']));
        await sleep(2000);
    }
    Promise.all(datos).then(function(results) {
        
        global_precios = {};
        for (let pos = 0; pos < results.length; pos++) {
            if (results[pos]["dias"] == "1") {
                var precio = results[pos]['resultados'][results[pos]['resultados'].length -1];
                global_precios[results[pos]['moneda']] = precio;
            }
        }
        global_estadisticas = results;
        io.emit('precios', global_precios);
        io.emit('estadisticasReal', results);
    });
}

// Solicita a la api de COINGecko los resultado de los días que le pasemos y la moneda.
function getDatosCoin(iso, days, nombre, decimales){
    return new Promise(function (fulfill, reject){
        axios.get(`https://api.coingecko.com/api/v3/coins/${iso}/market_chart?vs_currency=eur&days=${days}`)
        .then((response) => {
            var resultados = [];
            var tiempos = [];
            // Recorremos el resultado para colocarlo como queremos posteriormente.
            for (let index = 0; index < response["data"]["prices"].length; index++) { 
                resultados.push(response["data"]["prices"][index][1]); // Guardamos el campo 1, el precio.
                tiempos.push(response["data"]["prices"][index][0]); // Guardamos el campo 0, el tiempo de dicho precio.
            }
            fulfill({"resultados":resultados, "tiempos":tiempos, "moneda":iso, "dias":days, "nombre": nombre, "decimales": decimales});
        });
    });
}

// Crear la conexión
function conexion(sql,callback){
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "crypto_simulator"
    });
    connection.connect();
    connection.query(sql, function (error, results, fields) {
        return callback(results);
    });
    connection.end();
}

// Función para pausar el node.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//----------------PETICIONES------------------

// Petición para registrar un nuevo usuario.
app.post('/registrarUsuario', function(req, res) {
    var registro = req.body["registro"];
    // Comprobamos que no existe el usuario o el correo
    conexion(` SELECT count(nombre) nombre, count(correo) correo FROM usuarios WHERE  nombre = '${registro["usuario"]}' OR correo = '${registro["correo"]}' `, function(result){
        if (result[0]["nombre"] != 0) {
            res.json({"Result": "Error", "Error" : "El usuario ya está en uso."});
        } else if (result[0]["correo"] != 0) {
            res.json({"Result": "Error", "Error" : "El correo ya está en uso."});
        } else {
            // Insertamos el usuario
            conexion(` SELECT insertarUsuario ('${registro["usuario"]}', '${registro["correo"]}', '${registro["password"]}') cod_usuario `, function(result){
                if (result[0]["cod_usuario"]) {
                    var arry_sql = []
                    for (let pos = 0; pos < global_monedas.length; pos++) {
                        arry_sql.push(` ( '${global_monedas[pos]["cod_moneda"]}', '${result[0]["cod_usuario"]}' )  `);
                    } 
                    conexion(`INSERT INTO cartera ( cod_moneda, cod_usuario) VALUES  ${arry_sql.join(', ')}`  , function(result){
                        conexion(`INSERT INTO saldo (cod_usuario, saldo, invertido) VALUES ('${registro["usuario"]}', '100', '100')`  , function(result){
                            res.json({"Result": "Correcto", "Token": token});
                        });
                    });   
                } else {
                    res.json({"Result": "Error", "Error": "Error al crear registrarse."});
                }  
            });
        }
    }); 
});

// Petición para iniciar sesión.
app.post('/iniciarSesion', function(req, res) {
    var inicio = req.body["inicio"];
    // Comprobamos si existe el usuario
    conexion(` SELECT count(*) Existe, nombre, cod_usuario FROM usuarios WHERE  password = '${inicio["password"]}' AND  ( nombre = '${inicio["usuario"]}' OR correo = '${inicio["usuario"]}') `, function(result){
        if (result[0]["Existe"] == 1 ) {
            res.json({"Result": "Correcto", "Token": token, "Nombre": result[0]["nombre"], "Cod_Usuario": result[0]["cod_usuario"]});
        } else {
            res.json({"Result": "Error", "Error": "La nombre de usuario, el correo o la contraseña no son correctas."});
        }
    });
});

// Petición para solicitar las estadísticas iniciales del menu principal el cual devolveremos 1 día.
app.get('/getEstadisticasGenerales', function(req, res) {
    var array_dia1 = [];
    for (let pos = 0; pos < global_estadisticas.length; pos++) {
        if (global_estadisticas[pos]["dias"] == 1) {
            array_dia1.push(global_estadisticas[pos]);
        }
    }
    res.json(array_dia1);
});

// Petición para solicitar las estadísticas iniciales.
app.post('/getEstadisticasIndividual', function(req, res) {
    var moneda = req.body["moneda"]["nombre"];
    var array_indi = [];
    console.log(moneda);
    console.log(global_estadisticas);
    for (let pos = 0; pos < global_estadisticas.length; pos++) {
        console.log(global_estadisticas[pos]["moneda"]);
        if (global_estadisticas[pos]["moneda"] == moneda) {
            array_indi.push(global_estadisticas[pos]);
        }
    }      
    res.json(array_indi);
});

// Petición que devuelve los datos de la cartera individual
app.post('/getCarteraIndividual', function(req, res) {
    var cod_moneda = req.body["datos"]["cod_moneda"];
    var cod_usuario = req.body["datos"]["cod_usuario"];
    conexion(` SELECT num_tokens, capital, (SELECT saldo FROM saldo WHERE cod_usuario = '${cod_usuario}') saldo FROM cartera WHERE cod_moneda = '${cod_moneda}' AND cod_usuario = '${cod_usuario}' `, function(result){
        res.json(result);
    });
});

app.post('/comprarMoneda', function(req, res) {
    var cod_moneda = req.body["datos"]["cod_moneda"];
    var cod_usuario = req.body["datos"]["cod_usuario"];
    var tokens = req.body["datos"]["tokens"];
    var capital = req.body["datos"]["capital"];
    conexion( `UPDATE cartera SET num_tokens = num_tokens + ${tokens} ,capital = capital + ${capital} WHERE cod_moneda = '${cod_moneda}' AND cod_usuario = '${cod_usuario}' `, function(result){
        if (result.affectedRows == 1) {
            conexion( `UPDATE saldo SET saldo = saldo - ${capital}  WHERE cod_usuario = '${cod_usuario}' `, function(result){
                if (result.affectedRows == 1) {
                    conexion( `INSERT INTO movimentos( cod_usuario, cod_moneda, tipo, capital, num_tokens) VALUES ('${cod_usuario}', '${cod_moneda}', 'compra', '${capital}', '${tokens}') `, function(result){
                        if (result.affectedRows == 1) {
                            res.json({"Result": "Correcto"});
                        } else {
                            res.json({"Result": "Error", "Error": "Hubo un problema a la hora de comprar, intenteló mas tarde."});
                        }
                    });
                } else {
                    res.json({"Result": "Error", "Error": "Hubo un problema a la hora de comprar, intenteló mas tarde."});
                }
            });
        } else {
            res.json({"Result": "Error", "Error": "Hubo un problema a la hora de comprar, intenteló mas tarde."});
        }
        
    });
});

// Petición para vender moneda
app.post('/venderMoneda', function(req, res) {
    var cod_moneda = req.body["datos"]["cod_moneda"];
    var cod_usuario = req.body["datos"]["cod_usuario"];
    var tokens = req.body["datos"]["tokens"];
    var capital = req.body["datos"]["capital"];
    conexion( `UPDATE cartera SET num_tokens = num_tokens - ${tokens} ,capital = capital - ${capital} WHERE cod_moneda = '${cod_moneda}' AND cod_usuario = '${cod_usuario}' `, function(result){
        if (result.affectedRows == 1) {
            conexion( `UPDATE saldo SET saldo = saldo + ${capital}  WHERE cod_usuario = '${cod_usuario}' `, function(result){
                if (result.affectedRows == 1) {
                    conexion( `INSERT INTO movimentos( cod_usuario, cod_moneda, tipo, capital, num_tokens) VALUES ('${cod_usuario}', '${cod_moneda}', 'venta', '${capital}', '${tokens}') `, function(result){
                        if (result.affectedRows == 1) {
                            res.json({"Result": "Correcto"});
                        } else {
                            res.json({"Result": "Error", "Error": "Hubo un problema a la hora de vender, intenteló mas tarde."});
                        }
                    });
                } else {
                    res.json({"Result": "Error", "Error": "Hubo un problema a la hora de vender, intenteló mas tarde."});
                }
            });
            
        } else {
            res.json({"Result": "Error", "Error": "Hubo un problema a la hora de vender, intenteló mas tarde."});
        }
        
    });
});

// Petición para solicitar el saldo
app.post('/getSaldo', function(req, res) {
    var cod_usuario = req.body["datos"]["cod_usuario"];
    console.log(cod_usuario);
    conexion( ` SELECT saldo, invertido FROM saldo WHERE cod_usuario = '${cod_usuario}' `, function(result){
        console.log(result);
        res.json({"saldo": result[0]["saldo"], "invertido": result[0]["invertido"]});
    });
});

// Petición invertir Saldo
app.post('/invertirSaldo', function(req, res) {
    var cod_usuario = req.body["datos"]["cod_usuario"];
    var inversion = req.body["datos"]["inversion"];
    conexion(`UPDATE saldo SET saldo = saldo + ${inversion} ,invertido = invertido + ${inversion} WHERE cod_usuario = '${cod_usuario}' `, function(result){
        if (result.affectedRows == 1) {
            res.json({"Result": "Correcto"});
        } else {
            res.json({"Result": "Error"});
        } 
    });
});

// Petición para solicitar el resumen.
app.post('/getResumen', function(req, res) {
    var cod_usuario = req.body["datos"]["cod_usuario"];
    conexion(`SELECT *, cod_moneda AS moneda, (SELECT nombre FROM monedas WHERE cod_moneda = moneda) AS nombreMoneda FROM cartera WHERE cod_usuario = '${cod_usuario}' AND num_tokens != 0 ORDER BY capital DESC`, function(result){
        for (let pos = 0; pos < result.length; pos++) {
            result[pos]["precio"] = global_precios[result[pos]["cod_moneda"]];
        }
        res.json(result);
    });
});

// Peticiónes para solicita el resumen movimientos.
app.post('/resumenMovimientos', function(req, res) {
    var cod_usuario = req.body["datos"]["cod_usuario"];
    conexion(`SELECT *, cod_moneda as cod ,(SELECT nombre FROM monedas WHERE cod_moneda = cod) nombre FROM movimentos WHERE cod_usuario = '${cod_usuario}' ORDER BY fecha DESC`, function(result){
        res.json(result);
    });
});

// Peticiónes para recuperar la contraseña
app.post('/recuperarPassword', function(req, res) {
    var inicio = req.body["inicio"];
    // Comprobamos si existe el usuario
    conexion(` SELECT count(*) Existe, nombre, correo, password FROM usuarios WHERE   nombre = '${inicio["usuario"]}' OR correo = '${inicio["usuario"]}' `, function(result){
        if (result[0]["Existe"] == 1 ) {
            var correo = result[0]["correo"];
            var nombre = result[0]["nombre"];
            var password = result[0]["password"];
            let transporter = nodemailer.createTransport({ 
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: 'CryptoSimulatorDeveloper@gmail.com',
                    pass: 'CryptoC6dQaZDfgsGW'
                }
            });
            
            let mailOptions = {
                from: 'CryptoSimulatorDeveloper@gmail.com',
                to: correo,
                subject: 'Recuperación Contraseña',
                html: `Hola <b>${nombre}</b>. <BR>
                Su contraseña es: <b>${password}</b>
                <BR>
                <BR>
                Saludos desde CryptoSimulator.
                `
            };
            
            transporter.sendMail(mailOptions, (error, info) => { // Mandamos el la contraseña al correo indicado.
                res.json({"Result": "Correcto", "Correo": correo});
            });


        } else {
            res.json({"Result": "Error", "Error": "La nombre de usuario, el correo o la contraseña no son correctas."});
        }
    });
});












