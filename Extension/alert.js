document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get('url') || 'Unknown site';
  
  const flaggedUrlElement = document.getElementById('flaggedUrl');
  if (flaggedUrlElement) {
    flaggedUrlElement.textContent = url;
  }
  
  document.title = `Blocked: ${url} — POCSO SafeGuard`;

  const backButton = document.getElementById('backBtn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      // If there is a previous page in history, go back to it
      if (document.referrer && document.referrer !== window.location.href) {
        window.location.href = document.referrer;
      } else if (history.length > 1) {
        history.back();
      } else {
        // Fallback: send user to Google safely
        window.location.href = 'https://www.google.com';
      }
    });
  }
});
