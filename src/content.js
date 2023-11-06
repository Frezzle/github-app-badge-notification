console.log('first')
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

	async function getNotificationsPage() {
		const resp = await fetch('https://github.com/notifications', {
			headers: {
				'Cache-Control': 'no-cache',
			},
			mode: 'no-cors',
		});
		const body = await resp.text();
		return new DOMParser().parseFromString(body, 'text/html');
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
	// if (window.matchMedia('(display-mode: standalone)').matches) {
		updateBadgeIcon();
		console.log(chrome)
		console.log(chrome.alarms)
		chrome.alarms.create('', {
			periodInMinutes: 0.5, // can't do faster than 30s :( https://developer.chrome.com/docs/extensions/reference/alarms
		}, updateBadgeIcon);
	// }

console.log('last')
