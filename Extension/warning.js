const params = new URLSearchParams(window.location.search);
const badUrl = params.get('url');
const strikes = params.get('strikes') || 1;

document.getElementById('bad-url').textContent = badUrl || 'Unknown URL';
document.getElementById('strike-text').textContent = `Strike ${strikes} of 3`;

document.getElementById('btn-back').addEventListener('click', () => {
  window.history.back(); // Or close tab if history is empty
  // fallback if couldn't go back
  setTimeout(() => { window.location.href = "https://google.com"; }, 500);
});

document.getElementById('btn-proceed').addEventListener('click', () => {
  // To allow them to bypass the webNavigation lock temporarily, we could add a special token.
  // For the hackathon, we simply instruct them that the strike counter went up.
  // We can force load the site by telling the background script to temporarily ignore it, 
  // but webNavigation block is automatic. For a simple implementation, we just alert them:
  alert("WARNING: For the Hackathon Demo, proceeding anyway is disabled for your safety. A strike has been recorded.");
  window.history.back();
});
