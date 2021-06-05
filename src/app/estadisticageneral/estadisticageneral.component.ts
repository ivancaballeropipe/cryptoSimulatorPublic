import { Component, OnInit} from '@angular/core';
import {NgbModal,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WebSocketService} from '../web-socket.service';
import * as Chartist from 'chartist';
import { Router } from '@angular/router';



declare var jQuery:any;
declare var $:any;


@Component({
	selector: 'componente-estadisticageneral',
	templateUrl: './estadisticageneral.component.html',
	styleUrls: ['./estadisticageneral.component.css']
})
export class EstadisticageneralComponent implements OnInit {
	
	constructor(private WebSocketService: WebSocketService, private router:Router) { 
	
	}	

	ngOnInit() {
		// Solicitamos las monedas
		$.ajax({ // Solicitamos todos las estadisticas de las monedas
			type: "GET",
			dataType: "JSON",
			async:false,
			url: "http://localhost:3000/getEstadisticasGenerales",
			success: function (data) {
				console.log("CargaPrincipal");
				for (let index = 0; index < data.length; index++) {
					console.log(data[index]['dias']);
					if (data[index]['dias'] ==  "1") { // Comprobamos que se las del día 1.
						console.log(precio);
						var precio = data[index]['resultados'][data[index]['resultados'].length -1]; // sacamos dle ultimo valor el precio.
						precio = precio.toFixed(data[index]['decimales']);
						$(`#titulo_${data[index]['moneda']}`).html(`${data[index]['nombre']}: ${precio} €`);
						new Chartist.Line(`#${data[index]['moneda']}`, {
							labels: [],
							series: [
								data[index]['resultados']
							]
						}, {
							fullWidth: true,
							chartPadding: {
							right: 40
							}
						}).on('created',function (data) {
							$(".ct-labels").css("display","none");
							$(".ct-grid").css("display","none");
							$(".ct-point").css("display","none");
							$(".ct-series-a .ct-line").css("stroke-width","blue");
							$(".ct-series-a .ct-line").css("stroke-width","1px");
							
						});	
					}	
				}
				
			}
		});
		
		// Cargar Socket.
		this.WebSocketService.listen('estadisticasReal').subscribe((datos) =>{ // socket para recargar de forma automatica las estadísticas.
			var data = Object.values(datos);
			console.log("estadisticasRealGeneral");
			for (let index = 0; index < data.length; index++) {
				if (data[index]['dias'] == 1) { // Compruebas que es la estadística sea 1
					var precio = data[index]['resultados'][data[index]['resultados'].length -1];
					precio = precio.toFixed(data[index]['decimales']);
					var titulo =`${data[index]['nombre']}: ${precio} €`;
					$("#titulo_" + data[index]['moneda']).html(titulo);
					new Chartist.Line(`#${data[index]['moneda']}`, {
						labels: [],
						series: [
							data[index]['resultados']
						]
					}, {
						fullWidth: true,
						chartPadding: {
						right: 40
						}
					}).on('created',function (data) {
						$(".ct-labels").css("display","none");
						$(".ct-grid").css("display","none");
						$(".ct-point").css("display","none");
						$(".ct-series-a .ct-line").css("stroke-width","blue");
						$(".ct-series-a .ct-line").css("stroke-width","1px");
					});	
				}			
			}
		});
		
  	}

	// Función para redireccionar al componente invividual con sus estadisticas.
    redireccionar(moneda) {
    	this.WebSocketService.close();
		this.router.navigate(['/individual' ,moneda]);
	}

}
