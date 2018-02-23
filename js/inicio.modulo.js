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
		var codigo = window.localStorage.getItem("sesion");
		
		if (codigo == null && codigo == undefined && codigo == '')
			location.href = "index.html";
		else
			showPanel("listaMensajes", function(){
				getRemoteMensajes();
				
				getMensajes({
					after: function(mensajes){
						$(".listaMensajes").find("li").remove();
						$.each(mensajes, function(i, mensaje){
							var titulo = $("<b />", {
								class: "mb-1",
								text: mensaje.titulo
							});
							
							var li = $("<li />", {
								class: "list-group-item"
							});
							
							li.append(titulo).append('<small>' + mensaje.fecha + '</small>');
							li.attr("data", JSON.stringify(mensaje));
							$(".listaMensajes").append(li);
							console.log(li);
						});
					}
				});
			});
	}
};

//app.initialize();

$(document).ready(function(){
	app.onDeviceReady();
});

function getRemoteMensajes(){
	try{
		//db = openDatabase({name: "tracking.db"});
		db = window.sqlitePlugin.openDatabase({name: 'betel.db', location: 1, androidDatabaseImplementation: 2});
		console.log("Conexión desde phonegap OK");
		crearBD(db);
	}catch(err){
		alertify.error("No se pudo crear la base de datos con sqlite... se intentará trabajar con web");
		db = window.openDatabase("betel.db", "1.0", "BD de Betel", 200000);
		crearBD(db);
		console.log("Se inicio la conexión a la base para web");
	}
	var objUser = new TUsuario;
	var inicio = window.localStorage.getItem("fecha");
	
	objUser.getMensajes({
		"inicio": inicio,
		after: function(resp){
			db.transaction(function(tx){
				$.each(resp, function(i, mensaje){
					tx.executeSql('insert into mensaje(idMensaje, titulo, fecha, mensaje) values (?, ? , ?, ?)', [mensaje.idMensaje, mensaje.titulo, mensaje.fecha, mensaje.mensaje], function(){
						console.log(mensaje, "insertado");
					}, errorDB);
				});
			});
		}
	});
	
	var hoy = new Date();
	inicio = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() + ' ' + hoy.getHours() + ":" + hoy.getMinutes() + ":" + hoy.getMilliseconds();
	window.localStorage.setItem("fecha", inicio);
}

function getMensajes(datos){
	if (datos.before !== undefined) datos.before();
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM mensaje', [], function(tx, rs) {
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
		//tx.executeSql('drop table if exists tienda');
		tx.executeSql('CREATE TABLE IF NOT EXISTS mensaje (idMensaje integer primary key, titulo text, fecha text, mensaje text)', [], function(){
			console.log("tabla mensaje creada");
		}, errorDB);
	});
}

function errorDB(tx, res){
	console.log("Error: " + res.message);
}