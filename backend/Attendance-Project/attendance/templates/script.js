document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const captureButton = document.getElementById('captureButton');
  const message = document.getElementById('message');

  // Check if getUserMedia is supported
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Request access to the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Display the video stream in the video element
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error('Error accessing the camera: ', err);
      });

    // Capture face button click event
    captureButton.addEventListener('click', () => {
      // Capture the current frame of the video
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas content to base64 data URL
      const imageDataURL = canvas.toDataURL('image/png');

      // You can send this imageDataURL to your server for processing using AJAX

      // Output a message
      message.textContent = "Face captured successfully!";
    });
  } else {
    console.error('getUserMedia is not supported on your browser');
  }
});
