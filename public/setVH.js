function setVh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// Handle viewport changes including mobile keyboard
function handleViewportChange() {
  setVh();
  
  // Force a repaint to ensure button positions update
  if (document.activeElement && document.activeElement.tagName === 'INPUT') {
    requestAnimationFrame(() => {
      window.scrollTo(0, window.scrollY);
    });
  }
}

window.addEventListener("load", setVh);
window.addEventListener("resize", handleViewportChange);
window.addEventListener("orientationchange", handleViewportChange);

// Handle mobile keyboard show/hide
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", handleViewportChange);
}
