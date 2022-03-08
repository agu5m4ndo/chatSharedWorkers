//-----------------------------------------------------------------------------//
//----------------------Cambiar el tamaño del input automáticamente------------//
//-----------------------------------------------------------------------------//


const container = document.querySelector(".container");
const textInput = document.querySelector(".text-box");
const message = document.querySelector(".message");

const changingSize = () => {
	textInput.style.width = (container.clientWidth-120)+"px";
}

const observer = new ResizeObserver(changingSize);
observer.observe(container);

//-----------------------------------------------------------------------------//
//-------------------------------Crear mensajes--------------------------------//
//-----------------------------------------------------------------------------//

const conversation = document.querySelector(".conversation");
let lastSent = ""; //Con esto recuerdo de quien fue el último mensaje para cambiar el estilo de ser necesario
let lastSentCounter = 1;

const createChatMessage = (message, sentBy) => {
	let msgContainer = document.createElement("div");
	let msgBlock = document.createElement("div");
	let text = document.createElement("h2");
	let spike = document.createElement("div");

	if (sentBy == "by-me") {//Da las clases específicas y crea el piquito del mensaje
		msgContainer.classList.add("sent");
		spike.classList.add("spike-right");
	} else {
		msgContainer.classList.add("received");
		spike.classList.add("spike-left");
	} 

	msgBlock.classList.add("message",sentBy);
	text.innerHTML = message;

	if (lastSent == sentBy) { //le da un margen dependiendo si es el primer mensaje o no
		msgBlock.style.margin = "2px 30px 2px";
		lastSentCounter ++;
	} else {
		msgBlock.style.margin = "9px 10px 2px";
		lastSentCounter = 0;
		if (spike.classList.contains("spike-left")) {
			msgContainer.appendChild(spike);
		}
	}

	lastSent = sentBy;
	msgBlock.appendChild(text);
	msgContainer.appendChild(msgBlock);

	if (spike.classList.contains("spike-right") && lastSentCounter == 0) {
		msgContainer.appendChild(spike);
	}

	return msgContainer;
}

//-----------------------------------------------------------------------------//
//------------------------------Shared workers---------------------------------//
//-----------------------------------------------------------------------------//

const messageWorker = new SharedWorker("sharedWorkerChat.js"); //Encargado de los mensajes

messageWorker.port.addEventListener("message", e =>{
	sendButton("by-others",e.data);
});

messageWorker.port.start();

const profileWorker = new SharedWorker("sharedWorkerProfile.js"); //Encargado de los perfiles

profileWorker.port.addEventListener("message", e =>{
	applyProfile(JSON.parse(e.data));
});

profileWorker.port.start();

//-----------------------------------------------------------------------------//
//---------------------funcionalidad del botón enviar--------------------------//
//-----------------------------------------------------------------------------//

const button = document.querySelector(".sendButton");

button.addEventListener("click", ()=>{sendButton("by-me", textInput.value)});

textInput.addEventListener("keydown", e => {
	if (e.key == "Enter") {
		sendButton("by-me", textInput.value);
	}
});

function sendButton(byWho, textValue) {
	if (byWho == "by-me") {
		if (textValue.trim().length != 0) {//evita que se envien mensajes en blanco
			messageWorker.port.postMessage(textValue);
			let mensaje = createChatMessage(textValue, byWho);	
			conversation.appendChild(mensaje); //agrega el mensaje al último lugar
			scrollPosition();
			textInput.value = "";
		} 
	} else {
		let mensaje = createChatMessage(textValue, byWho);	
		conversation.appendChild(mensaje); //agrega el mensaje al último lugar
		scrollPosition();
		textInput.value = "";
	}
}

function scrollPosition() { //mantiene el scroll en el último mensaje enviado
	conversation.scrollTop = conversation.scrollHeight;
}

//-----------------------------------------------------------------------------//
//---------------------ventana de opciones y perfil----------------------------//
//-----------------------------------------------------------------------------//

const optionButton = document.getElementById("button-checkbox");
const optionList = document.querySelector(".options");
const editProfile = document.querySelector(".edit-profile");
const emptyChat = document.querySelector(".empty-chat");
const exitProfile = document.querySelector(".exit-profile");
const profileInterface = document.querySelector(".profile-interface");
const picture = document.querySelector(".picture");
const inputPicture = document.querySelector(".addPicture");
const topName = document.querySelector(".top-name");
const profileName = document.querySelector(".name");
const profile = document.querySelector(".profile");

optionButton.addEventListener("click", ()=> {
	if (optionButton.checked) {
		optionList.classList.add("show");
	} else {
		optionList.classList.remove("show");
	}
});

editProfile.addEventListener("click", ()=> {
	optionList.classList.remove("show");
	profileInterface.classList.add("view");
	blur("on");
});

exitProfile.addEventListener("click", () => {
	profileInterface.classList.remove("view");
	blur("off");
	changeProfilePicture(inputPicture.files[0]);
});

emptyChat.addEventListener("click", ()=> {
	optionList.classList.remove("show");
	conversation.replaceChildren();
	lastSent = "";
});

picture.addEventListener("click",() => {
	inputPicture.click();
});

inputPicture.addEventListener("change", () => {
	changeProfilePicture(inputPicture.files[0]);
});

const blur = status => {
	let topBox = document.querySelector(".top-box");
	let chat = document.querySelector(".chat");

	switch (status) {
		case "on":
			topBox.classList.add("blur");
			chat.classList.add("blur");
			break;
		case "off":
			topBox.classList.remove("blur");
			chat.classList.remove("blur");
			break;
	}
}

const changeProfilePicture = (newPicture) => {
	let reader = new FileReader();
	reader.readAsDataURL(newPicture);
    let url = URL.createObjectURL(newPicture);
    let source = "url('" + url + "')";
	reader.addEventListener("load", e => {
        picture.style.backgroundColor = "none";
		picture.style.backgroundImage = source;
	});
	sendProfileInfo(source, profileName);
}

const sendProfileInfo = (source, name) => { //envía al worker la información del perfil en un JSON
	let object = {
		"name": name.innerText,
		"source": source
	}
	profileWorker.port.postMessage(JSON.stringify(object));
}

//-----------------------------------------------------------------------------//
//------------------------------Envio del perfil-------------------------------//
//-----------------------------------------------------------------------------//

const applyProfile = (data) => {
	topName.innerText = data.name;
	profile.style.backgroundImage = data.source;
	profile.style.backgroundColor = "none";
}