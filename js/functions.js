var server = "http://192.168.2.4/betel-web/interface.php";
//var server = "http://192.168.0.12/betel-web/interface.php";
//var server = "http://www.colegiobetel.edu.uy/web/mensajes/interface.php";
var server = "https://intranet.colegiobetel.edu.uy/api/comunicaciones";

ServerAPI = "AlzaSyB9dNgR4Ly7Ich63FIHIFbZd1_zOdcg9OI";
applicationId = "5a96c15c1db2dc10a0165814";
SenderID = "600570554530";

function showPanel(panel, after, efecto){
	$("[panel]").hide();
	
	if (after == undefined)
		after = null;
	
	switch(efecto){
		case 'faderight':
			$("[panel=" + panel + "]").show("slide", { direction: "right" }, 500);
		break;
		case 'fadeleft':
			$("[panel=" + panel + "]").show("slide", { direction: "left" }, 500);
		break;
		case 'slow':
			$("[panel=" + panel + "]").show("slow", after);
		break;
		default:
			$("[panel=" + panel + "]").show(1, after);
			
	}
}


var mensajes = {
	alert: function(data){
		if (data.funcion == undefined)
			data.funcion = function(){};
			
		if (data.titulo == undefined)
			data.titulo = " ";
		
		try{
			navigator.notification.alert(data.mensaje, data.funcion, data.titulo, data.boton);
		}catch(err){
			window.alert(data.mensaje);
		}

	},
	
	confirm: function(data){
		if (data.funcion == undefined)
			data.funcion = function(){};
			
		if (data.titulo == undefined)
			data.titulo = " ";
		
		
		try{
			navigator.notification.confirm(data.mensaje, data.funcion, data.titulo, data.botones);
		}catch(err){
			if (confirm(data.mensaje))
				data.funcion(1);
			else
				data.funcion(2);
		}
	},
	
	log: function(data){
		alertify.log(data.mensaje);
	},
	
	prompt: function(data){
		if (data.funcion == undefined)
			data.funcion = function(){};
			
		if (data.titulo == undefined)
			data.titulo = " ";
		
		
		try{
			navigator.notification.prompt(data.mensaje, data.funcion, data.titulo, data.botones);
		}catch(err){
			var result = prompt(data.mensaje);
			data.funcion({
				buttonIndex: 1,
				input1: result
			});
		}
	},
};


function checkConnection(alertar = true) {
	try{
		var networkState = navigator.connection.type;
	
		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';
		
		switch(networkState){
			case Connection.NONE:
				if(alertar)
					alertify.error("Verifica tu conexión, la aplicación necesita conexión a internet");
					
				return false;
			break;
			default:
				return true;
		}
	}catch(e){
		return true;
	}
}