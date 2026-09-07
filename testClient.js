async function sendSOS() {
  try {
    const response = await fetch('http://localhost:5000/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: 'USER-NAFUD-01',
        latitude: 28.4381,
        longitude: 41.6905,
        message: 'SOS - Lost in Nafud Desert, need mesh relay'
      })
    });
    const data = await response.json();
    console.log('Response from server:', data);
  } catch (error) {
    console.error('Error sending SOS:', error);
  }
}

sendSOS();