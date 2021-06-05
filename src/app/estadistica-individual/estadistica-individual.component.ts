import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router'
import * as Chartist from 'chartist';
import { WebSocketService} from '../web-socket.service';
import {NgbModal,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2'
declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'componente-individual',
  templateUrl: './estadistica-individual.component.html',
  styleUrls: ['./estadistica-individual.component.css']
})

// Componente que muestra de forma individualizada la estadística de la moneda seleccionada

export class EstadisticaIndividualComponent implements OnInit {
  public moneda: String;
  public precio: String;
  public nombre: String;
  public dias: String;
  public arr: any;
  registrado:string;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
	private WebSocketService: WebSocketService,
	private modalService: NgbModal
  ) { 
    this.dias = "1"; // Cargamos como predefinido el día 1.
	this.arr = [];
	this.registrado = localStorage.getItem('registrado'); // Seteamos que esté registrado.
  }

	ngOnInit() {
		var precio, nombre;
		var resultados = [];
		this._route.params.subscribe((params:Params) =>{
			this.moneda = params["moneda"]
		});
		
		$.ajax({ // petición que devuelve las estadisticas de la moneda solicitada.
			type: "POST",
			dataType: "JSON",
			async:false,
			data: {moneda: {"nombre":this.moneda}},
			url: "http://localhost:3000/getEstadisticasIndividual",
			success: function (data) {
				resultados = data;
				console.log(data);
				precio = data[0]['resultados'][data[0]['resultados'].length -1]; // Obtenemos el último valor el cual será el precio actual
				nombre = data[0]['nombre'];
				$("#nombreMoneda").text(nombre);
				precio = precio.toFixed(data[0]['decimales']); // Lo tratamos con el campo decimales para que quede de forma vista.
				$("#titulo_moneda").text(`${precio} €`); // Seteamos el titulo con el precio.
				new Chartist.Line(`#chartMoneda`, { // Mostramos la estadistica.
					labels: [],
					series: [
						data[0]['resultados']
					]
				}, {
					height:"50%",
					with:"100%"
					
				}).on('created',function (data) { // quitamos los estilos.
					$(".ct-grid").css("display","none");
					$(".ct-point").css("display","none");
					$(".ct-series-a .ct-line").css("stroke-width","blue");
					$(".ct-series-a .ct-line").css("stroke-width","1px");
				});	
			}
		});
		
		this.precio = precio;
		this.nombre = nombre;
		this.arr = resultados;
		// Cargar Socket.
		this.WebSocketService.listen('estadisticasReal').subscribe((datos) =>{ // Solicita las estadísticas generales.
			var data = Object.values(datos);
			this.arr = [];
			for (let index = 0; index < data.length; index++) {
				if (data[index]["moneda"] == this.moneda) {
					this.arr.push(data[index]);
				}
				if (data[index]["moneda"] == this.moneda && data[index]["dias"] == this.dias) { // de todas las estadisticas buscamos el día seleccionado y la moneda seleccionada
					var precio = data[index]['resultados'][data[index]['resultados'].length -1];
					precio = precio.toFixed(data[index]['decimales']);
					this.precio = precio;
					$("#titulo_moneda").text(`${precio} €`);
					$("#precioActual").val(`${precio} €`);
					new Chartist.Line(`#chartMoneda`, { // repintamos la estadistica para que seá a tiempo real
						labels: [],
						series: [
							data[index]['resultados']
						]
					}, {
						height:"50%",
						with:"100%"
					}).on('created',function (data) {
						//$(".ct-labels").css("display","none");
						$(".ct-grid").css("display","none");
						$(".ct-point").css("display","none");
						$(".ct-series-a .ct-line").css("stroke-width","blue");
						$(".ct-series-a .ct-line").css("stroke-width","1px");
						
					});	
					this.cargar(); // Función para cargar los datos de la cartera
				}	
			}
		}); 
		this.cargar(); // Función para cargar los datos de la cartera
	}

  	// Función para cargar el periodo de dias de la busqueda y estadísticas.
	cambiarDias(dias) { 
		this.dias = dias;
		for (let index = 0; index < this.arr.length; index++) { // recorremos los datos que teneos guardados de forma global
			if (this.arr[index]['dias'] == dias) { // buscamos por día.
				new Chartist.Line(`#chartMoneda`, {
					labels: [],
					series: [
						this.arr[index]['resultados']
					]
				}, {
					height:"50%",
					with:"100%"
				}).on('created',function (data) {
					$(".ct-grid").css("display","none");
					$(".ct-point").css("display","none");
					$(".ct-series-a .ct-line").css("stroke-width","blue");
					$(".ct-series-a .ct-line").css("stroke-width","1px");
				});	
			}
		}	
	}

	// Función para abrir la el modal on la compra.
	abrirModalCompra(content) {
		this.modalService.open(content, { size: 'sm', backdrop: 'static' });
		$("#tituloCompra").text(this.nombre);
		$("#pestaniaToken").text(this.nombre);
		$("#precioActual").val(`${this.precio} €`);
		this.cargar();
		
	}

	// Función para comprar monedas
	comprarMoneda() { 
		var tokens = 0;
		var capital = 0;
		var saldo = $("#saldoDisponible").attr("dato");
		var entra = true;
		var precio = String(this.precio);
		if ( $(".active").text() == "Euros" ){ // Comprobamos si son por Euros
			capital = parseFloat($("#inputEuros").val());
			if (saldo < parseFloat($("#inputEuros").val())) { // Comprobamos que el saldo sea menor a lo solicitado.
				entra = false;
				Swal.fire('Oops...', 'No tienes saldo suficiente.', 'error');
			} else if (capital <= 0 || $("#inputEuros").val() == "") { // Comprobamos que sea distinto de vacío y que sea mayor de 0.
				entra = false;
				Swal.fire('Oops...', 'El valor en Euros no es válido', 'error');
			}
			tokens = parseFloat(String(capital)) / parseFloat(precio);
		}  else { // Comprobamos que es por Tokens
			tokens = parseFloat($("#inputTokens").val());
			capital= tokens * parseFloat(precio);
			if (saldo < capital) { // Comprobamos que el saldo sea menor a lo solicitado.
				entra = false;
				Swal.fire('Oops...', 'No tienes saldo suficiente.', 'error');
			} else if (tokens <= 0 || $("#inputTokens").val() == "") {
				entra = false;
				Swal.fire('Oops...', `El valor en ${this.nombre} no es válido`, 'error');
			}
		}

		if (entra) { // Si entra
			var texto = `Se va a proceder a comprar ${tokens} ${this.nombre} por el precio de ${capital} €`;
			let timerInterval;
			Swal.fire({
				title: '¡Atención!',
				html: texto ,
				timer: 30000,
				timerProgressBar: true,
				showCancelButton: true,
				confirmButtonText: 'Comprar!!!',
				cancelButtonText: 'Cancelar...',
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				reverseButtons: true,
			willClose: () => {
				clearInterval(timerInterval);
			}
			}).then((result) => {
				if (result.isConfirmed) {
					$.ajax({ // Petición para realizar compra.
						type: "POST",
						dataType: "JSON",
						async:false,
						data: {datos: {"cod_moneda":this.moneda, "cod_usuario": localStorage.getItem('cod_usuario'), "tokens": tokens, "capital":capital}},
						url: "http://localhost:3000/comprarMoneda",
						success: function (data) {
							if (data["Result"] == "Error") {
								Swal.fire('Oops...', data["Error"], 'error');
							} else if (data["Result"] == "Correcto") {
								Swal.fire(`Enhorabuena!!`, "Se ha realizado la compra correctamente!", 'success');
								$(".close").click();
								
							}
						}
					});
					this.cargar();
				}
			})
		}
  	}
	
	// Función para vender monedas
	venderMoneda() {
		var tokens = 0;
		var capital = 0;
		var entra = true;
		var precio = String(this.precio);
		if ( $(".active").text() == "Euros" ){
			capital = parseFloat($("#inputEuros").val());
			// Comprobaciones
			if ( capital <= 0 || $("#inputEuros").val().length == 0 ) {
				entra = false;
				Swal.fire('Oops...', 'El valor en Euros no es válido', 'error');
			} else if (capital > parseFloat($("#capitalTotal").val())) {
				entra = false;
				Swal.fire('Oops...', 'No tienes tantos Euros para vender.', 'error');
			}
			tokens = parseFloat(String(capital)) / parseFloat(precio);
		} else {
			tokens = parseFloat($("#inputTokens").val());
			// Comprobaciones
			if ( tokens <= 0 || $("#inputTokens").val().length == 0 ) {
				entra = false;
				Swal.fire('Oops...', `El valor en ${this.nombre} no es válido`, 'error');
			} else if (tokens > parseFloat($("#tokenTotales").val())) {
				entra = false;
				Swal.fire('Oops...', 'No tienes tantos Tokens para vender.', 'error');
			}
			capital = parseFloat(precio) * parseFloat(String(tokens));
		}

		if (entra) {
			var texto = `Se va a proceder a vender ${tokens.toFixed(5)} ${this.nombre} por el precio de ${capital.toFixed(5)} €`;
			let timerInterval;
			Swal.fire({
				title: '¡Atención!',
				html: texto ,
				timer: 30000,
				timerProgressBar: true,
				showCancelButton: true,
				confirmButtonText: 'Vender!!!',
				cancelButtonText: 'Cancelar...',
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				reverseButtons: true,
			willClose: () => {
				clearInterval(timerInterval);
			}
			}).then((result) => {
				if (result.isConfirmed) {
					$.ajax({
						type: "POST",
						dataType: "JSON",
						async:false,
						data: {datos: {"cod_moneda":this.moneda, "cod_usuario": localStorage.getItem('cod_usuario'), "tokens": tokens.toFixed(5), "capital":capital.toFixed(5)}},
						url: "http://localhost:3000/venderMoneda",
						success: function (data) {
							if (data["Result"] == "Error") {
								Swal.fire('Oops...', data["Error"], 'error');
							} else if (data["Result"] == "Correcto") {
								Swal.fire(`Enhorabuena!!`, "Se ha realizado la compra correctamente!", 'success');
								$(".close").click();
								
							}
						}
					});
					this.cargar();
				}
			})
		}
	}
	 // Función que carga el modal con el la cartera que tenemos en ese mismo momento
	cargar(){
		if (this.registrado == null) {
			$(".carteraIndividual").css("display", "none");
		} else {
			var nombre = this.nombre;
			var precio = this.precio;
			$.ajax({
				type: "POST",
				dataType: "JSON",
				async:false, 
				data: {datos: {"cod_moneda":this.moneda, "cod_usuario": localStorage.getItem('cod_usuario')}},
				url: "http://localhost:3000/getCarteraIndividual",
				success: function (data) {
					var datos = data[0];
					console.log(datos);
					// Datos del modal
					$("#saldoDisponible").val(datos["saldo"] + " €");
					$("#saldoDisponible").attr("dato" ,datos["saldo"]);
					$("#capitalDisponible").val(datos["capital"] + " €");
					$("#capitalDisponible").attr("dato" ,datos["capital"]);
					$("#tokensDisponible").val(datos["num_tokens"]);
					$("#tokensDisponible").attr("dato" ,datos["num_tokens"]);
					if (datos["num_tokens"] != 0) {
						var precioActual = parseFloat(String(datos["num_tokens"]))  *  parseFloat(String(precio));
						if (precioActual > parseFloat(datos["capital"])) {
							var diferencia = precioActual - parseFloat(datos["capital"])
							$("#capitalTotal").text(precioActual.toFixed(5) + " € (+ " + diferencia.toFixed(5) + " €)" );
							$("#capitalTotal").css("color", "green");
						} else {
							var diferencia = parseFloat(datos["capital"]) - precioActual;
							$("#capitalTotal").text(precioActual.toFixed(5) + " € (- " + diferencia.toFixed(5) + " €)");
							$("#capitalTotal").css("color", "red");
						}
						$("#tokenTotales").text(`${datos["num_tokens"]} ${nombre}`);
					} else {
						$("#capitalTotal").text("0 €");
						$("#tokenTotales").text(`0`);
					}
				}
			});
		}
		
	}
}
