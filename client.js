const socket = io();

// Load existing statuses
socket.on('load statuses', (statuses) => {
  statuses.forEach(status => addStatusToFeed(status));
});

// Listen for new status updates
socket.on('status update', (status) => {
  addStatusToFeed(status);
});

// Function to add status to the feed
function addStatusToFeed(status) {
  const feed = document.getElementById('feed');
  const statusElement = document.createElement('div');
  statusElement.innerText = `${status.username}: ${status.status} (at ${new Date(status.created_at).toLocaleTimeString()})`;
  feed.appendChild(statusElement);
}

// Add status form submission
document.getElementById('status-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const status = document.getElementById('status').value;

  socket.emit('new status', { username, status });

  // Clear the input field
  document.getElementById('status').value = '';
});
