let tabs = [];

self.addEventListener("connect", e => {
	const port = e.ports[0];

	tabs.push(port);

	port.addEventListener("message", e => {
		if (tabs[0]==e.target) {
			tabs[1].postMessage(e.data);
		} else {
			tabs[0].postMessage(e.data);
		}
	});

	port.start();
});