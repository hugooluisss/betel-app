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
var objUser;
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
				
		// Should be called once app receive the notification only while the application is open or in background
		window.plugins.PushbotsPlugin.on("notification:received", function(data){
			console.log("received:", data);
			//Silent notifications Only [iOS only]
			//Send CompletionHandler signal with PushBots notification Id
			window.plugins.PushbotsPlugin.done(data.pb_n_id);
			console.log(data);
				
			window.plugins.PushbotsPlugin.resetBadge();
		});
		
		// Should be called once the notification is clicked
		window.plugins.PushbotsPlugin.on("notification:clicked", function(data){
			console.log("clicked:" + JSON.stringify(data));
			if (data.message != undefined)
				alertify.log(data.message);
				
			window.plugins.PushbotsPlugin.resetBadge();
		});


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
		
		//Get device token
		window.plugins.PushbotsPlugin.getRegistrationId(function(token){
		    console.log("Registration Id:" + token);
		});	
		
		window.plugins.PushbotsPlugin.on("user:ids", function (data) {
			console.log("user:ids" + JSON.stringify(data));
			// userToken = data.token; 
			// userId = data.userId
		});
		
		var codigo = window.localStorage.getItem("sesion");
		if (codigo == null && codigo == undefined && codigo == ''){
			location.href = "index.html";
			window.localStorage.removeItem("fecha");
		}else{
			try{
				//db = openDatabase({name: "tracking.db"});
				db = window.sqlitePlugin.openDatabase({name: 'betel.db', location: 1, androidDatabaseImplementation: 2});
				console.log("Conexión desde phonegap OK");
				crearBD(db);
			}catch(err){
				//alertify.error("No se pudo crear la base de datos con sqlite... se intentará trabajar con web");
				db = window.openDatabase("betel.db", "1.0", "BD de Betel", 200000);
				crearBD(db);
				console.log("Se inicio la conexión a la base para web");
			}
			
			showPanel("listaMensajes", function(){
				getMensajes({
					after: function(mensajes){
						$(".listaMensajes").find("li").remove();
						$.each(mensajes, function(i, mensaje){
							addMensaje(mensaje);
						});
						
						getRemoteMensajes();
					}
				});
			});
			
			window.plugins.PushbotsPlugin.resetBadge();
			window.plugins.PushbotsPlugin.toggleNotifications(true);
			
			//window.plugins.PushbotsPlugin.debug(true);
			var celular = window.localStorage.getItem("celular");
			window.plugins.PushbotsPlugin.setAlias("cel_" + celular);
		}		
		
		$("#showMensajes").click(function(){
			$("[panel=mensaje]").hide("slide", { direction: "right" }, 500);
		});
		
		$("#actualizarMensajes").click(function(){
			getMensajes({
				before: function(){
					getRemoteMensajes();
				},
				after: function(mensajes){
					$(".listaMensajes").find("li").remove();
					$.each(mensajes, function(i, mensaje){
						addMensaje(mensaje);
					});
				}
			});
		});
		
		$("#salir").click(function(){
			mensajes.confirm({
				mensaje: "¿Seguro de querer salir?", 
				funcion: function(buttonIndex){
		    		if(buttonIndex == 1) {
			    		db.transaction(function(tx){
			    			tx.executeSql("delete from mensaje", [], function(tx, rs){
			    				var celular = window.localStorage.getItem("celular");
			    				window.plugins.PushbotsPlugin.removeAlias();
			
			    				window.localStorage.removeItem("sesion");
			    				window.localStorage.removeItem("fecha");
			    				location.href = "index.html";
			    			}, function(){
			    				alertify.error("No se pudo cerrar la sesión");
			    			});
			    		});
			    	}
			    }
	    	});
		});
		
		setInterval(function(){
			if(checkConnection(false))
				getRemoteMensajes(false);
		}, 10 * 1000);
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
});

function addMensaje(mensaje){
	var titulo = $("<span />", {
		class: "mb-1",
		text: mensaje.titulo
	});
	
	var li = $("<li />", {
		class: "list-group-item"
	});
	
	li.append(titulo); //.append('<br /><span class="badge">' + mensaje.fecha + '</span>');
	li.attr("data", JSON.stringify(mensaje));
	$(".listaMensajes").prepend(li);
	
	if (mensaje.estado == 2){
		li.addClass("leido");
	}
	
	li.click(function(){
		var mensaje = jQuery.parseJSON($(this).attr("data"));
		$.each(mensaje, function(key, valor){
			$("[panel=mensaje]").find("[campo=" + key + "]").html(valor);
		});
		
		var fecha = mensaje.fecha.split(" ");
		fecha = fecha[0].split("-");
		
		//$("[panel=mensaje]").find("[campo=fecha]").html(fecha[2] + "/" + fecha[1] + "/" + fecha[0]);
		$("[panel=mensaje]").show("slide", { direction: "right" }, 500);
		
		$("[panel=mensaje]").find("a[target='_system']").click(function(e){
		    e.preventDefault();
		    window.open($(e.currentTarget).attr('href'), '_system', '');
	    });
		
		if (mensaje.estado < 2){
			li.removeClass("leido");
			
			$.post(server, {
				"id": mensaje.referencia,
				"action": 'setLeido',
			}, function(){
				db.transaction(function(tx){
					tx.executeSql("update mensaje set actualiza = 0 where referencia = ? ", [mensaje.referencia], function(tx, rs){
						li.addClass("leido");
					}, errorDB);
				});
			});
			
			db.transaction(function(tx){
				var hoy = new Date();
				fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() + ' ' + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
				tx.executeSql("update mensaje set estado = 2, actualiza = 1 where referencia = ? ", [mensaje.referencia], function(tx, rs){
					li.addClass("leido");
				}, errorDB);
			});
		}
	});
}

function getRemoteMensajes(alertar = true){
	if(checkConnection(alertar)){
		var objUser = new TUsuario;
		//window.localStorage.removeItem("fecha");
		var inicio = window.localStorage.getItem("fecha");
		result = new Array();
		
		
		$("#actualizarMensajes").addClass("fa-spin");
		
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM mensaje where actualiza = 1 order by referencia desc', [], function(tx, rs) {
				for (i = 0 ; i < rs.rows.length ; i++){
					result.push(rs.rows.item(i));
				}
				
				console.log(JSON.stringify(result));
				
				objUser.getMensajes({
					"inicio": inicio,
					"actualizacion": JSON.stringify(result),
					after: function(resp){
						$("#actualizarMensajes").removeClass("fa-spin");
						db.transaction(function(tx){
							var cont = 0;
							var nuevos = 0;
							var band = true;
							$.each(resp, function(i, mensaje){
								cont++;
								tx.executeSql("select * from mensaje where referencia = ? ", [mensaje.idMensaje], function(tx, rs){
									cont++;
									if (rs.rows.length == 0){
										tx.executeSql('insert into mensaje(referencia, titulo, fecha, mensaje, estado, actualiza) values (?, ? , ?, ?, ?, 0)', [mensaje.idMensaje, mensaje.titulo, mensaje.fecha, mensaje.mensaje, mensaje.estado], function(){
											mensaje.referencia = mensaje.idMensaje;
											addMensaje(mensaje);
										}, errorDB);
										nuevos++;
									}else
										tx.executeSql('update mensaje set titulo = ?, fecha = ?, mensaje = ?, estado = ?, actualiza = 0 where referencia = ?', [mensaje.titulo, mensaje.fecha, mensaje.mensaje, mensaje.estado, mensaje.idMensaje], function(){
											//addMensaje(mensaje);
										}, errorDB);
										
										
									if (resp.length <= cont && band){
										if (nuevos > 0){
											alertify.log("Tienes nuevos mensajes");
											band = false;
										}
									}
								}, errorDB);
								
								
							});
							
							tx.executeSql('update mensaje set actualiza = 0 where actualiza = 1', [], function(tx, rs){}, errorDB);
						});
						
						var hoy = new Date();
						inicio = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() + ' ' + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getSeconds();
						window.localStorage.setItem("fecha", inicio);
					}
				});
				
				//if (datos.after !== undefined) datos.after(result);
			}, errorDB);
		});
	}
}

function getMensajes(datos){
	if (datos.before !== undefined) datos.before();
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM mensaje order by referencia asc', [], function(tx, rs) {
			result = new Array();
			for (i = 0 ; i < rs.rows.length ; i++){
				result.push(rs.rows.item(i));
			}
			if (datos.after !== undefined) datos.after(result);
		}, errorDB);
	});
}

function crearBD(){
	db.transaction(function(tx){
		//tx.executeSql('drop table if exists mensaje');
		//tx.executeSql('update mensaje set actualiza = 1, estado = 1');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS mensaje (referencia integer, titulo text, fecha text, mensaje text, estado integer, actualiza integer)', [], function(){
			console.log("tabla mensaje creada");
		}, errorDB);
		/*
		tx.executeSql('ALTER TABLE IF EXISTS mensaje add referencia integer', [], function(){
		});
		*/
	});
}

function errorDB(tx, res){
	console.log("Error: ", res);
}