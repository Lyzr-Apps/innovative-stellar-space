/**
 * Build Error Detector - Static Script
 *
 * This script runs BEFORE React and detects Next.js build errors.
 * It's loaded via a script tag injected by middleware.
 */
(function() {
  'use strict';

  // Only run in iframe
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  if (!isInIframe()) return;

  var sentErrors = {};

  function sendBuildError(message, details) {
    // Dedupe
    var key = message.substring(0, 100);
    if (sentErrors[key]) return;
    sentErrors[key] = true;

    var timestamp = new Date().toISOString();

    // Generate fix prompt
    var fixPrompt = '## BUILD ERROR - Fix Required\n\n';
    fixPrompt += '**Error:** ' + message + '\n\n';

    if (message.indexOf("Module not found") !== -1 || message.indexOf("Can't resolve") !== -1) {
      var match = message.match(/Can't resolve '([^']+)'/);
      var missingModule = match ? match[1] : 'unknown';
      fixPrompt += '## THE FIX:\n';
      fixPrompt += 'The import "' + missingModule + '" does not exist. Either:\n';
      fixPrompt += '1. **Create the missing file** at the expected path\n';
      fixPrompt += '2. **Remove the import** if not needed\n';
      fixPrompt += '3. **Fix the import path** if wrong\n\n';
      fixPrompt += '**IMPORTANT:** Do NOT import components you have not created!\n';
    }

    if (details) {
      fixPrompt += '\n**Details:**\n```\n' + details.substring(0, 1500) + '\n```\n';
    }

    try {
      // Send error to parent
      window.parent.postMessage({
        type: 'CHILD_APP_ERROR',
        source: 'architect-child-app',
        payload: {
          type: 'build_error',
          message: message,
          stack: details,
          timestamp: timestamp,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }, '*');

      // Send fix request
      window.parent.postMessage({
        type: 'FIX_ERROR_REQUEST',
        source: 'architect-child-app',
        payload: {
          type: 'build_error',
          message: message,
          action: 'auto_detected',
          fixPrompt: fixPrompt,
          timestamp: timestamp,
          url: window.location.href
        }
      }, '*');

      console.log('[BuildErrorDetector] Error sent to parent:', message.substring(0, 100));
    } catch (e) {
      console.error('[BuildErrorDetector] Failed:', e);
    }
  }

  function checkForErrors() {
    var bodyText = document.body ? document.body.innerText : '';
    var title = document.title || '';

    // Check for Next.js build errors
    if (
      bodyText.indexOf('Module not found') !== -1 ||
      bodyText.indexOf("Can't resolve") !== -1 ||
      bodyText.indexOf('Build Error') !== -1 ||
      bodyText.indexOf('Syntax error') !== -1 ||
      bodyText.indexOf('Failed to compile') !== -1 ||
      title.indexOf('Error') !== -1
    ) {
      // Extract error message
      var message = 'Build Error';
      var moduleMatch = bodyText.match(/Can't resolve '([^']+)'/);
      if (moduleMatch) {
        message = "Module not found: Can't resolve '" + moduleMatch[1] + "'";
      } else if (bodyText.indexOf('Failed to compile') !== -1) {
        message = 'Failed to compile';
      }

      sendBuildError(message, bodyText.substring(0, 2000));
    }
  }

  // Check on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForErrors);
  } else {
    checkForErrors();
  }
  window.addEventListener('load', checkForErrors);

  // Watch for DOM changes
  var observer = new MutationObserver(function() {
    checkForErrors();
  });

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      setTimeout(startObserver, 100);
    }
  }
  startObserver();

  // Check periodically for first 5 seconds
  var checks = 0;
  var interval = setInterval(function() {
    checkForErrors();
    checks++;
    if (checks > 10) clearInterval(interval);
  }, 500);

  console.log('[BuildErrorDetector] Static script initialized');
})();
