let tabs = [];

self.addEventListener('connect', e =>{
	const port = e.ports[0];
	
	if (tabs.length <=2) { //Intento de evitar que una tercera pestaña irrumpa en la conversación
		tabs.push(port);
	} 

	port.addEventListener('message', function(e) {
		if (e.target!=tabs[0]) { //verifica de donde viene el mensaje para enviarlo a la página correspondiente
			tabs[0].postMessage(e.data);
		} else {
			tabs[1].postMessage(e.data);
		}
  	});

	port.start();
});
