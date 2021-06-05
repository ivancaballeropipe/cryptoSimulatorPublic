import { Component} from '@angular/core';
import {NgbModal,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
declare var jQuery:any;
declare var $:any;


@Component({
    selector: 'componente-cabecera',
    templateUrl: './cabecera.component.html',
    styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent {
    registrado:string;
    
    constructor( private modalService: NgbModal, private router:Router) {
       this.registrado = localStorage.getItem('registrado'); // Guardamos como global el valor de registro
    }

    // Función para abrir los modales.
    abrirModal(content) {
        this.modalService.open(content, { size: 'sm', backdrop: 'static' });
    }

    // Función para mostrar el saldo e insertarlo.
    abrirSaldoModal(content) {
        var cod_usuario = localStorage.getItem('cod_usuario');
        this.modalService.open(content, { size: 'sm', backdrop: 'static' });
        // Solicitamos el saldo.
        $.ajax({
            type: "POST",
            dataType: "JSON",
            url: "http://localhost:3000/getSaldo",
            data: {datos: {"cod_usuario": cod_usuario}},
            success: function (data) {
                $("#totalInvertido").val(data["invertido"] + " €");
                $("#saldoActual").val(data["saldo"] + " €");
            }
        });
    }

    // Función para iniciar sesión
    iniciarSesion() {
        var usuario = $("#inicioUsuario").val();
        var password = $("#inicioPassword").val(); 
        var entra = true;

        if (usuario == "") { // Comprobamos que el usuario y el correo están completos
            Swal.fire('Oops...', 'Debe indicar un correo o nombre de usuario.', 'error');
            entra = false;
        } else if (password == "") { // Comprobamos que haya introducido la contraseña
            Swal.fire('Oops...', 'Debe indicar una contraseña.', 'error');
            entra = false;
        }

        if (entra) { // En caso de que todo esté correcto
            $.ajax({ // Iniciamos sesión
                type: "POST",
                dataType: "JSON",
                url: "http://localhost:3000/iniciarSesion", 
                data: {inicio: {"usuario":usuario.trim(), "password": password.trim()}},
                success: function (data) {
                    if (data["Result"] == "Error") { // En caso que haya cualquier tipo de problema en la petición 
                        Swal.fire('Oops...', data["Error"], 'error');
                    } else if (data["Result"] == "Correcto") { // Si todo ha sido correcto.
                        $(".close").click();
                        localStorage.setItem('registrado', "True");
                        localStorage.setItem('token', data["Token"]); 
                        localStorage.setItem('cod_usuario', data["Cod_Usuario"]); 
                        Swal.fire(`Bienvenido ${data["Nombre"]}!`, "Has iniciado sesión de forma correcta!", 'success').then((result) => {
                            this.registrado = "True";
                            window.location.reload();
                        });;
                         
                    }
                }
            });
        }
    }

    //Función que se utiliza para registar.
    registrarUsuario()  {
        var registro = {};
        var regex = /^(?=.*\d)(?=.*[a-záéíóúüñ]).*[A-ZÁÉÍÓÚÜÑ]/; //
        var entra = true; // variable ara comprobar el 

        $(".registro").each(function(){ // Recorremos todos los campos del registro
            var name = $(this).attr("name"); // Nombre del elemento
            var valor = $(this).val(); // valor del elemento
            
            // Comprobaciones
            if ( name == "correo" && !/^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i.test(valor) ) { // Tratamiento de errores con el campo Correo.
                Swal.fire('Oops...', 'El correo no tiene un formato válido.', 'error');
                entra = false;
            } else if ( name == "usuario" && valor.length < 6 ) { // Tratamiento de errores con el campo Usuario.
                Swal.fire('Oops...', 'El usuario debe tener un mínimo de 6 caracteres.', 'error');
                entra = false;
            } else if ( name == "password" && ( !regex.test(valor) || valor.length < 8 ) )  { // Tratamiento de errores con el campo Contraseña.
                Swal.fire('Oops...', 'La contraseña debe contener una mayúscula una minúscula, un dígito y estar compuesta de 8 caracteres.', 'error');
                entra = false;
            } else if ( name == "password" && ( $("#registroPasswordRepet").val() != $("#registroPassword").val() ) ) { // Tratamiento de errores con el campo Contraseña Repetida.
                Swal.fire('Oops...', 'Las contraseñas no coinciden.', 'error');
                entra = false;
            } else if (name != "passwordRepet" ) { // Si todo va bien recogemos todos los datos menos la contraseña repetida que ya la tenemos
                registro[name] = valor.trim();
            }
        });

        if (entra) {
            $.ajax({ // petición para registrar el usuario
                type: "POST",
                dataType: "JSON",
                url: "http://localhost:3000/registrarUsuario",
                data: {registro: registro},
                success: function (data) {
                    if (data["Result"] == "Error") {
                        Swal.fire('Oops...', data["Error"], 'error');
                    } else if (data["Result"] == "Correcto") {  // Si todo es correcto se lo indicamos al cliente y registramos los datos.
                        $(".close").click();
                        localStorage.setItem ('registrado', "True"); // Indicamos que estamos registrados.
                        localStorage.setItem ('token', data["Token"]); 
                        Swal.fire(`Bienvenido ${registro["usuario"]}!`, "Te has registrado de forma correcta!", 'success', ).then((result) => {
                            this.registrado = "True";
                            window.location.reload();
                        });;
                    }
                }
            });
        }   
    }

    // Función para finalizar sesión
    finalizarSesion() {
        Swal.fire({ // Preguntamos si quiere desconectarse.
            title: 'Adios...',
            text: "¿Está seguro de querer desconectarse?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, desconectar...'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("registrado"); // Eliminamos el registro
                localStorage.removeItem("token"); // Eliminamos el token
                localStorage.removeItem("cod_usuario"); // Eliminamos el token
                this.registrado = null;
                this.router.navigate(['/']); // Devolvemos a la pantalla principal.
            }
        })
    }

    // Función para invertir euros.
    invertir(){
        var inversion = $("#cuandoInvertir").val(); 
        if (inversion.length > 0) { // Comprobamos que la inversión es mayor de 0 
            Swal.fire({ // Preguntamos si está seguro de hacer la inversión.
                title: `¿Estás seguro de invertir ${inversion} €?`,
                text: "Esta inversión estará disponible para cualquier token.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Invertir!!'
            }).then((result) => {
                if (result.isConfirmed) {
                    var cod_usuario = localStorage.getItem('cod_usuario');
                    $.ajax({ // realizamos la petición de invertir.
                        type: "POST",
                        dataType: "JSON",
                        url: "http://localhost:3000/invertirSaldo",
                        data: {datos: {"cod_usuario": cod_usuario, "inversion" : inversion}},
                        success: function (data) {
                            if (data["Result"] == "Correcto") {
                                Swal.fire("Inversión completa", "La inversión se ha realizado correctamente, dispondrá de ella a la hora de invertir en cualquier moneda", "success");
                                $(".close").click();
                            } else {
                                Swal.fire("Error", "Ops... parece que hubo un error a la hora de hacer la inversión, por favor intentelo mas tarde...", "error");
                            }
                        }
                    });
                }
            })
        } else {
            Swal.fire("Error", "Ops... parece que esa cantidad no es válida", "error");
        }
    }

    // Función para enviar al resumen en caso de que esté registrado.
    resumen() {
		this.router.navigate(['/resumen']);
    }

    // Función para recuperar la contraseña.
    recuperarPassword() {
        var usuario = $("#inicioUsuario").val();
        var entra = true;

        if (usuario == "") { // Comprobamos que el usuario y el correo están completos
            Swal.fire('Oops...', 'Debe indicar un correo o nombre de usuario.', 'error');
            entra = false;
        }

        if (entra) { 
            $.ajax({ // realizamos la petición de invertir.
                type: "POST",
                dataType: "JSON",
                url: "http://localhost:3000/recuperarPassword",
                data: {inicio: {"usuario": usuario}},
                success: function (data) {
                    if (data["Result"] == "Correcto") {
                        Swal.fire("Recuperación completa.", "Se ha enviado la contraseña al correo " + data["Correo"], "success");
                        $(".close").click();
                    } else {
                        Swal.fire("Error", "Ops... parece que hubo un error a la hora de recuperar la contraseña.", "error");
                    }
                }
            });
        }
       
    }

}
