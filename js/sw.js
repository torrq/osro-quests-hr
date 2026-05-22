// sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      // You can add paths to your actual icons here
      icon: '/icon.png', 
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 'osro-timer'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Closes the notification if the user clicks it
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Focus the tab if it's already open, otherwise open a new one
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});