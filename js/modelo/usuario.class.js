TUsuario = function(fn){
	var self = this;
	
	this.requestCode = function(datos){
		if (datos.before !== undefined) datos.before();
		
		$.post(server + 'interface.php', {
			"celular": datos.celular,
			"action": 'requestCodeVerify',
		}, function(resp){
			if (resp.band == false)
				console.log(resp.mensaje);
				
			if (datos.after !== undefined)
				datos.after(resp);
		}, "json");
	}
	
	this.verificarCodigo = function(datos){
		if (datos.before !== undefined) datos.before();
		
		$.post(server + 'interface.php', {
			"celular": datos.celular,
			"codigo": datos.codigo,
			"action": 'verifyCode',
		}, function(resp){
			if (resp.band == false)
				console.log(resp);
				
			if (datos.after !== undefined)
				datos.after(resp);
		}, "json");
	}
	
	this.getMensajes = function(datos){
		if (datos.before !== undefined) datos.before();
		
		var codigo = window.localStorage.getItem("sesion");
		$.post(server + 'interface.php', {
			"codigo": codigo,
			"inicio": datos.inicio,
			"action": 'getMsgs',
		}, function(resp){
			if (datos.after !== undefined)
				datos.after(resp);
		}, "json");
	}
	
	this.getData = function(datos){
		if (datos.fn.before !== undefined) datos.fn.before();
		$.post(server + 'ctransportistas', {
				"id": datos.id,
				"action": 'getData',
				"movil": 1
			}, function(data){
				if (data.band == 'false')
					console.log("No se pudo recuperar la información del usuario");
					
				if (datos.fn.after !== undefined)
					datos.fn.after(data);
			}, "json");
	}
};