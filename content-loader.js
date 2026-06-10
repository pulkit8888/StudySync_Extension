// Injector for content script module
// This injects content.js into the page as a module to bypass content script restrictions

(function() {
  try {
    // Create a script element that will load content.js as a module
    const script = document.createElement('script');
    script.type = 'module';
    script.src = chrome.runtime.getURL('content.js');
    
    // Inject the script as early as possible
    if (document.documentElement) {
      document.documentElement.appendChild(script);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.appendChild(script);
      });
    }
    
    // Clean up the script tag after loading
    script.onload = () => script.remove();
    script.onerror = (error) => {
      console.error('Failed to load content module:', error);
      script.remove();
    };
  } catch (error) {
    console.error('Error setting up content script injector:', error);
  }
})();
