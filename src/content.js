(() => {
	let unreadCount;

	function getUnreadCount(doc) {
		if (!doc) {
			return -1;
		}
		const countElement = doc.querySelector('a.filter-item[href="/notifications"] > span.count');
		if (!countElement) {
			return -1;
		}
		if (countElement.innerText === '') {
			// inbox is empty (an explicit "0" is never shown)
			return 0;
		}
		const count = parseInt(countElement.innerText);
		if (isNaN(count)) {
			return -1;
		}
		return count;
	}

	function getNotificationsPage() {
		return new Promise((resolve) => {
			const x = new XMLHttpRequest();
			x.open('GET', '/notifications', true);
			x.withCredentials = true; // send cookie with request (auth)
			x.setRequestHeader('Cache-Control', 'no-cache');
			x.onreadystatechange = function () {
				if (x.readyState == XMLHttpRequest.DONE && x.status == 200) {
					const doc = (new DOMParser()).parseFromString(x.responseText, "text/html");
					resolve(doc);
				}
			};
			x.send(null);
		});
	}

	async function updateBadgeIcon() {
		const page = await getNotificationsPage();
		const newUnreadCount = getUnreadCount(page);
		if (newUnreadCount < 0) {
			return;
		}
		if (newUnreadCount !== unreadCount) {
			unreadCount = newUnreadCount
			navigator.setAppBadge(unreadCount);
		}
	}

	// Only bother to keep badge updated if the app is standalone (i.e. being used as PWA).
	// There seems to be no point (AFAICT) in doing it when viewing inside a browser tab.
	if (window.matchMedia('(display-mode: standalone)').matches) {
		updateBadgeIcon();
		setInterval(updateBadgeIcon, 10000);
	}
})();
