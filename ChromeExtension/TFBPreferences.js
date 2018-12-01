function saveOptions() {

	//Captura información de los elementos TFPPreferences
	var tfbUrl = document.getElementById('UrlInput').value;
	var tfbTimeout = document.getElementById('TimeoutInput').value;
	var tfbUsername = document.getElementById('UsernameInput').value;
	var tfbPassword = document.getElementById('PasswordInput').value;
	var tfbEditBeforeSend = document.getElementById('EditBeforeSendCheckbox').checked;

	//Guarda la información de los elementos en un array
	var tfbNewOptions = {
		tfbUrl: tfbUrl,
		tfbTimeout: tfbTimeout,
		tfbUsername: tfbUsername,
		tfbPassword: tfbPassword,
		tfbEditBeforeSend: tfbEditBeforeSend
	};

	
	function updateStatus(message) {
		//Recarga el mensaje de StatusLabel
		var status = document.getElementById('StatusLabel');
		status.textContent = message.toString();
		setTimeout(function () {
			status.textContent = '';
		}, 5000); //Tiempo que dura el mensaje show()
	}

	//Comprueba que los elementos no esten vacios
	if (!tfbUrl || !tfbTimeout || !tfbUsername || !tfbPassword) {
		updateStatus("All options are required");
	} else {
		//se comunica con la API de chrome y le envia el objeto y actualiza el mensaje
		chrome.storage.sync.set(tfbNewOptions, updateStatus("Options Saved!"));
	}
}

function restoreOptions() {
	//Información por defecto
	var tfbDefaultOptions = {
		tfbUrl: 'http://thefactbook.ml/',
		tfbTimeout: 5,
		tfbUsername: 'guest',
		tfbPassword: 'guest',
		tfbEditBeforeSend: true
	}

	//Llena el formulario con la información por defecto
	function fillValues(items) {
		document.getElementById('UrlInput').value = items.tfbUrl;
		document.getElementById('TimeoutInput').value = items.tfbTimeout;
		document.getElementById('UsernameInput').value = items.tfbUsername;
		document.getElementById('PasswordInput').value = items.tfbPassword;
		document.getElementById('EditBeforeSendCheckbox').checked = items.tfbEditBeforeSend;
	}

	
	chrome.storage.sync.get(tfbDefaultOptions, fillValues);

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('SaveButton').addEventListener('click', saveOptions);