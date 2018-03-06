TUsuario = function(fn){
	var self = this;
	
	this.requestCode = function(datos){
		if (datos.before !== undefined) datos.before();
		
		$.post(server, {
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
		
		$.post(server, {
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
		$.post(server, {
			"codigo": codigo,
			"inicio": datos.inicio,
			"actualizacion": datos.actualizacion,
			"action": 'getMsgs',
		}, function(resp){
			if (datos.after !== undefined)
				datos.after(resp);
		}, "json");
	}
};