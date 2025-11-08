import React, { useState, useEffect } from 'react';
import { getInstallPrompt } from '../../utils/pwa';
import './InstallPrompt.css';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Get install prompt
    getInstallPrompt().then((prompt) => {
      setDeferredPrompt(prompt);
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-icon">📱</div>
        <div className="install-prompt-text">
          <div className="install-prompt-title">Install App</div>
          <div className="install-prompt-description">
            Install Progres Tracker for a better experience
          </div>
        </div>
        <div className="install-prompt-actions">
          <button onClick={handleInstall} className="install-button">
            Install
          </button>
          <button onClick={handleDismiss} className="dismiss-button">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;

