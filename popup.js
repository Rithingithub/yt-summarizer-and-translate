document.addEventListener('DOMContentLoaded', function() {
  var summarizeBtn = document.getElementById('summarizeBtn');
  var translateBtn = document.getElementById('translateBtn');
  var status = document.getElementById('status');
  var resultSection = document.getElementById('resultSection');
  var summaryText = document.getElementById('summaryText');
  var translatedText = document.getElementById('translatedText');

  summarizeBtn.addEventListener('click', function() {
    status.textContent = 'Summarizing transcript...';

    // Retrieve the YouTube video URL from the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var videoUrl = tabs[0].url;

      // Make an AJAX request to the Flask server to summarize the transcript
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:5000/summarize', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.summary) {
              summaryText.textContent = response.summary;
              resultSection.style.display = 'block';
              status.textContent = '';
            } else {
              status.textContent = 'Failed to summarize the transcript.';
              resultSection.style.display = 'none';
            }
          } else {
            status.textContent = 'Error occurred while summarizing the transcript.';
            resultSection.style.display = 'none';
          }
        }
      };

      // Send the video URL in the request payload
      xhr.send(JSON.stringify({ 'videoUrl': videoUrl }));
    });
  });

  translateBtn.addEventListener('click', function() {
    var summary = summaryText.textContent;
    status.textContent = 'Translating summary...';

    // Make an AJAX request to the Flask server to translate the summary
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/translate', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          if (response.translatedText) {
            translatedText.textContent = response.translatedText;
            status.textContent = 'Translation complete.';
          } else {
            translatedText.textContent = 'Failed to translate the summary.';
            status.textContent = '';
          }
        } else {
          translatedText.textContent = 'Error occurred while translating the summary.';
          status.textContent = '';
        }
      }
    };

    // Send the summary in the request payload
    xhr.send(JSON.stringify({ 'summary': summary }));
  });
});
