/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var db = null;
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		document.addEventListener("backbutton", function(){
			return false;
		}, true);
		
		window.plugins.PushbotsPlugin.initialize(applicationId, {
			"android":{
				"sender_id": SenderID
			}
		});
		
		
		//window.plugins.PushbotsPlugin.debug(true);
		// Should be called once the device is registered successfully with Apple or Google servers
		window.plugins.PushbotsPlugin.on("registered", function(token){
			console.log("Token de registro", token);
		});
		
		window.plugins.PushbotsPlugin.on("user:ids", function (data) {
			console.log("user:ids" + JSON.stringify(data));
			// userToken = data.token; 
			// userId = data.userId
		});
		
		
		
		
		// Should be called once app receive the notification only while the application is open or in background
		window.plugins.PushbotsPlugin.on("notification:received", function(data){
			console.log("received:", data);
			var datos = JSON.stringify(data);
			window.plugins.PushbotsPlugin.resetBadge();
			
			/*
			//Silent notifications Only [iOS only]
			//Send CompletionHandler signal with PushBots notification Id
			window.plugins.PushbotsPlugin.done(data.pb_n_id);
			if (data.aps.alert != '')
				alertify.success(data.aps.alert);
				
			window.plugins.PushbotsPlugin.resetBadge();
			*/
		});
		
		window.plugins.PushbotsPlugin.on("notification:clicked", function(data){
			console.log("clicked:" + JSON.stringify(data));
			if (data.message != undefined)
				alertify.success(data.message);
				
			window.plugins.PushbotsPlugin.resetBadge();
		});
		
		window.plugins.PushbotsPlugin.removeAlias();
		
		//window.localStorage.removeItem("sesion");
		var codigo = window.localStorage.getItem("sesion");
		
		if (codigo != null && codigo != undefined && codigo != '')
			location.href = "inicio.html";
		else
			showPanel("bienvenida", function(){
				$("#txtCelular").focus();
			});
			
		var celular = window.localStorage.getItem("celular");
		$("#txtCelular").val(celular)
		
		$("#frmLogin").validate({
			debug: true,
			errorClass: "validateError",
			rules: {
				txtCelular: {
					required : true
				}
			},
			wrapper: 'span',
			submitHandler: function(form){
				var obj = new TUsuario;
				obj.requestCode({
					celular: $("#txtCelular").val(), 
					before: function(){
						$("#frmLogin [type=submit]").prop("disabled", true);
						showPanel("codigo", function(){
							$("#txtCodigo").val("").focus();
						});
					},
					after: function(data){
						$("#frmLogin [type=submit]").prop("disabled", false);
						window.localStorage.setItem("celular", $("#txtCelular").val());
						
						console.log(data);
						if (data.band == false){
							mensajes.alert({mensaje: "No se pudo enviar el SMS con el código, verifica que el número de tu telefono sea correcto", title: "Erro al enviar el código"});
							$("#frmLogin [type=submit]").prop("disabled", false);
							
							showPanel("bienvenida", function(){
								$("#txtCelular").focus();
							});
						}
					}
				});
			}
		});
		
		$("#frmCodigo").validate({
			debug: true,
			errorClass: "validateError",
			rules: {
				txtCodigo: {
					required : true
				}
			},
			wrapper: 'span',
			submitHandler: function(form){
				var obj = new TUsuario;
				obj.verificarCodigo({
					celular: $("#txtCelular").val(), 
					codigo: $("#txtCodigo").val(), 
					before: function(){
						$(form).find("[type=submit]").prop("disabled", true);
					},
					after: function(data){
						$(form).find("[type=submit]").prop("disabled", false);
						
						if (data.band == false){
							mensajes.alert({mensaje: "Código no válido", title: "Código inválido"});
							$("#txtCodigo").select();
						}else{
							window.localStorage.setItem("sesion", $("#txtCodigo").val());
							mensajes.alert({mensaje: "Bienvenido...", title: "Código correcto"});
							location.href = "inicio.html";
						}
					}
				});
			}
		});
		
		$("#btnShowBienvenida").click(function(){
			showPanel("bienvenida", function(){
				$("#txtCelular").focus();
			});
		});
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
});