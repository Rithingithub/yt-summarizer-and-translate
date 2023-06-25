// Function to send a message to the background script
function sendMessage(message) {
    chrome.runtime.sendMessage(message);
  }
  
  // Function to extract the YouTube video ID from the URL
  function extractVideoId(url) {
    let videoId = null;
    const match = url.match(/[?&]v=([^&]+)/);
    if (match) {
      videoId = match[1];
    }
    return videoId;
  }
  
  // Function to handle the DOM mutation
  function handleMutation(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const videoUrl = mutation.target.src;
        const videoId = extractVideoId(videoUrl);
  
        if (videoId) {
          // Send the video URL to the background script for processing
          sendMessage({ videoUrl: videoUrl });
        }
      }
    }
  }
  
  // Initialize the mutation observer to detect video changes
  const observer = new MutationObserver(handleMutation);
  observer.observe(document.querySelector('video'), { attributes: true });
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function (message) {
    // Perform actions based on the message received
    if (message.action === 'summarize') {
      // Perform summarization logic here
  
      // Send summarized transcript back to the background script
      sendMessage({ summary: 'This is a summarized transcript.' });
    }
  });
  