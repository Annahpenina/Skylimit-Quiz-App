<script>
  function loadUploadHistory() {
    fetch('/upload-history')
      .then(response => response.json())
      .then(history => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (history.length === 0) {
          list.innerHTML = '<li>No uploads yet.</li>';
          return;
        }

        history.forEach(item => {
          const li = document.createElement('li');
          const readableTime = new Date(item.timestamp).toLocaleString();

          li.innerHTML = `
            <strong>${item.name}</strong> 
            - ${readableTime} 
            - ${item.converted ? '🌀 Converted to PDF' : '✔ Uploaded'}
            - <a href="${item.path.replace(/\\/g, '/')}" target="_blank">View</a>
          `;

          list.appendChild(li);
        });
      })
      .catch(err => {
        document.getElementById('history-list').innerHTML = '<li>Error loading history.</li>';
        console.error('Error fetching history:', err);
      });
  }

  // Load on page load
  window.onload = loadUploadHistory;

  // Optional: refresh history after form submit
  const form = document.getElementById('upload-form');
  if (form) {
    form.addEventListener('submit', () => {
      setTimeout(loadUploadHistory, 2000);
    });
  }
</script>
