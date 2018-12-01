//--------------------------------------------------------------------------//

chrome.browserAction.setBadgeText({
	text: "TFB"
});

//--------------------------------------------------------------------------//

var clickHandler = function (e) {

	function notifyUser(message) {
		chrome.notifications.create("basic", {
			"type": "basic",
			"iconUrl": "Data/TFBIcon.png",
			"title": "TheFactBook:",
			"message": message.toString()
		});
	}

	//--------------------------------------------------------------------------//

	var tfbDefaultOptions = {
		tfbUrl: 'http://thefactbook.ml/',
		tfbTimeout: 5,
		tfbUsername: 'guest',
		tfbPassword: 'guest',
		tfbEditBeforeSend: true
	};

	chrome.storage.sync.get(tfbDefaultOptions, getAsyncOptions);

	//--------------------------------------------------------------------------//

	function getAsyncOptions(items) {
		var tfbUrl = items.tfbUrl;
		var tfbTimeout = items.tfbTimeout;
		var tfbUsername = items.tfbUsername;
		var tfbPassword = items.tfbPassword;
		var tfbEditBeforeSend = items.tfbEditBeforeSend;

		//--------------------------------------------------------------------------//
		function getAsyncTabUrl(tabs) {
			tabUrl = tabs[0].url;
			sendRequest();
		}

		chrome.tabs.query({
			currentWindow: true,
			active: true
		}, getAsyncTabUrl);
		//--------------------------------------------------------------------------//

		function sendRequest() {

			function sendFact(fact, source, tags) {
				var http = new XMLHttpRequest();
				http.open("POST", tfbUrl + "/api.php?action=addFact", true);
				http.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");

				http.timeout = tfbTimeout * 1000;
				http.ontimeout = function () {
					notifyUser("TheFactBook server has Timed out");
				};


				http.onreadystatechange = function () {
					if (http.readyState == 4 && http.status == 200) {
						var r = http.responseText;
						r = JSON.parse(r);
						if (!r.Error) {
							notifyUser("Your Fact has been saved!");
						} else {
							notifyUser(r.Description);
						}
					}
				};

				tfbUsername = encodeURIComponent(tfbUsername);
				tfbPassword = encodeURIComponent(tfbPassword);
				var params = "username=" + tfbUsername +
					"&password=" + tfbPassword +
					"&fact=" + fact +
					"&source=" + source +
					"&tags=" + tags;

				http.send(params);

			}

			if (tfbEditBeforeSend) {
				chrome.tabs.create({
					url: chrome.extension.getURL('TFBEditFact.html'),
					active: true,
				}, function (tab) {

					chrome.windows.create({
						tabId: tab.id,
						width: 450,
						height: 260,
						type: "popup"
					});

					chrome.runtime.sendMessage({
						msg: "editFact",
						fact: e.selectionText,
						source: tabUrl
					});

					chrome.runtime.onMessage.addListener(
						function (request, sender, sendResponse) {
							if (request.msg == "sendFact") {
								sendFact(request.fact, request.source, request.tags);

								if (request.dontEdit) {
									chrome.storage.sync.set({
										"tfbEditBeforeSend": false
									});
								}
								chrome.tabs.remove(tab.id);
							}

						}
					);

				});


			} else {
				sendFact(e.selectionText, tabUrl, "");
			}
		}
	}
}


//--------------------------------------------------------------------------//
/*
 *	Agregar la opción Add to TheFactBook al menu de opciones clic derecho
 */
chrome.contextMenus.create({
	"title": "Add to TheFactBook",
	"id": "tfb-menu",
	"contexts": ["selection"],
	"onclick": clickHandler
});

//--------------------------------------------------------------------------//