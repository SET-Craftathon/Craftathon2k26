// honeypot.js - The Silent Harvester

async function trapHacker() {
  try {
    // 1. Get the target they were trying to visit
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url') || 'Unknown';

    // 2. Silently fetch their IP address using a free public API
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const hackerIP = ipData.ip;

    // 3. Harvest Browser Fingerprint
    const metadata = {
      ip: hackerIP,
      target_url: targetUrl,
      browser: navigator.userAgent,
      os: navigator.platform,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString()
    };

    console.log("[Honeypot] Trapped Metadata: ", metadata);

    // 4. Send silently to the local Bridge Server (/log-hacker)
    await fetch('http://localhost:3000/log-hacker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });

    // 5. Change the UI to a fake permanent error after tracking is complete
    document.querySelector('.loader').style.display = 'none';
    document.querySelector('h2').textContent = 'ERR_CONNECTION_TIMED_OUT';
    document.querySelector('p').textContent = 'The server took too long to respond.';

  } catch (err) {
    console.error("[Honeypot] Silent trap failed.", err);
  }
}

// Execute immediately when the decoy page loads
trapHacker();
