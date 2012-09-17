chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {"width": 1024, "height": 768  });
});