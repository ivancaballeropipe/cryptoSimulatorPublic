import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { WebSocketService} from '../web-socket.service';

declare var jQuery:any; // Para cargar Jquery
declare var $:any;

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})

// Componente que muestra el resumen de las compras y ventas y las monedas en posesion

export class ResumenComponent implements OnInit {

	public preciosActuales: any;

  	constructor(private WebSocketService: WebSocketService) { 
		this.preciosActuales = [];
	}

	ngOnInit(): void {
		var cod_usuario = localStorage.getItem('cod_usuario'); // Setea el codigo de usuario.
		var preActuales = [];
		var capitalActual = [];
		// Cargamos el dinero invertido.
		$.ajax({
			type: "POST",
			dataType: "JSON",
			async:false,
			data: {datos: {"cod_usuario": cod_usuario}},
			url: "http://localhost:3000/getResumen", // Devuelve los datos del resumen.
			success: function (data) {
				preActuales = data;
				var texto = "";
				for (let index = 0; index < data.length; index++) { // Recorremos los valores recogidos.
					var actual = parseFloat(String(data[index]['num_tokens'])) * parseFloat(String(data[index]['precio'])); // Número de tokens por precio para sacar el costo actual
					capitalActual.push(actual); // añadire el precio actual al array global
					var color = "green";
					var diferencia = ` + ${( actual - parseFloat(String(data[index]['capital'])) ).toFixed(5)}`; 
					if (actual <= data[index]['capital']) { // en caso de que el precio sea mayor al que cogimos a la hora de comprar se mostrará en verde si no en rojo como negativo.
						color = "red";
						diferencia = ` ${(actual - parseFloat(String(data[index]['capital'])) ).toFixed(5)}`;
					}
					texto += `
						<div class='row'>
							<div class='col-12'>
								<h2>${data[index]['nombreMoneda']}</h2>
								<h5>Invertido: ${data[index]['capital']} €</h5>
								<h5>Tokens: ${data[index]['num_tokens']}</h5>
								<h5 style='color:${color}'>Actual:  ${actual.toFixed(5)} € ( ${diferencia} €)</h5>
							</div>
						</div>
					`; // Texto con toda la información de cada moneda que tengamos tokens.
				}
				$("#contenedorCartera").html(texto);  // Rellenamos el texto con el texto generado.
	
			}
		});

		this.preciosActuales = preActuales; // guardamos en global

		var estadisticas = {
			series: capitalActual,

		};

		this.cargarDonuts(estadisticas, capitalActual); // Función para cargar la estadistica tipo donuts

		this.resumenMovimientos(); // Función para solicitar todas las compras y ventas y cargarlas en una tabla.

		// Servicio el cual devuelve los precios de cada moneda en su momento para calcular y actualizar a tiempo real su capital actual
		this.WebSocketService.listen('precios').subscribe((datos) =>{ 
			var data = this.preciosActuales;
			var texto = "";	
			var capitalActual = [];
			for (let index = 0; index < data.length; index++) { // Recorremos los datos que hemos cargado en la primera petición y hemos hecho globales y les aplicamos los precios que nos vayan llegando
				var actual = parseFloat(String(data[index]['num_tokens'])) * parseFloat(String(datos[data[index]['moneda']]));
				capitalActual.push(actual);
				var color = "green";
				var diferencia = ` + ${(actual - parseFloat(String(data[index]['capital']))  ).toFixed(5)}`;
				if (actual <= data[index]['capital']) { // en caso de que el precio sea mayor al que cogimos a la hora de comprar se mostrará en verde si no en rojo como negativo.
					color = "red";
					diferencia = ` ${(actual - parseFloat(String(data[index]['capital'])) ).toFixed(5)}`;
				}
				texto += `
					<div class='row'>
						<div class='col-12'>
							<h2>${data[index]['nombreMoneda']}</h2>
							<h5>Invertido: ${data[index]['capital']} €</h5>
							<h5>Tokens: ${data[index]['num_tokens']}</h5>
							<h5 style='color:${color}'>Actual:  ${actual.toFixed(5)} € ( ${diferencia} €)</h5>
						</div>
					</div>
				`;
			}
			$("#contenedorCartera").html(texto); 
			var estadisticas = {
				series: capitalActual,
	
			}; 
			this.cargarDonuts(estadisticas, capitalActual); // volvemos a cargar la estadistica con los datos reales.
		}); 
 	}

	 // Función en la que pasamos los y el capital para generar la estadistica del tipo donuts.
	cargarDonuts(datos,capitalActual) {
		var preciosActuales = this.preciosActuales;
		var sum = function(a, b) { return a + b };
		new Chartist.Pie('.ct-chart', datos, {
			labelInterpolationFnc: function(value) {
				// retornamos la moneda y su porcentaje de dinero que tenemos actualmente.
				return preciosActuales[capitalActual.indexOf(value)]['nombreMoneda'] + ' ' + Math.round(value / datos.series.reduce(sum) * 100) + '%';
			}
		}).on('created',function (data) {
			$(".ct-label").css("font-weight","bold"); // Ponemos los valores en negrita para que se vean mejor
		});	;  
	}

	// Función que devuelve el listado de movimientos de compra y venta
	resumenMovimientos(){
		var cod_usuario = localStorage.getItem('cod_usuario');
		$.ajax({
			type: "POST",
			dataType: "JSON",
			async:false,
			data: {datos: {"cod_usuario": cod_usuario}},
			url: "http://localhost:3000/resumenMovimientos",
			success: function (data) {
				var tabla = ``;
				for (let index = 0; index < data.length; index++) {
					const date = new Date(data[index]["fecha"]);
					// Formateamos la fecha para que aparezca de una forma más legible.
					var fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours() }:${date.getMinutes() }` 
					tabla +=  `<div class='row' style='font-size:15px;margin-bottom:20px'>
					<div class='col-2 border-top'>${data[index]["nombre"]}</div>
					<div class='col-2 border-top'>${data[index]["num_tokens"]}</div>
					<div class='col-2 border-top'>${data[index]["capital"]} €</div>
					<div class='col-2 border-top'>${data[index]["tipo"]}</div>
					<div class='col-2 border-top'>${fecha}</div>
					</div>`;
				}
				// Rellenamos la tabla de movimientos
				$("#resumenMovimientos").html(tabla); 
			}
		});
	}


}
