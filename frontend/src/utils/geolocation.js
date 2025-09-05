// Utility function to help users reset geolocation permissions
export const getGeolocationResetInstructions = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    return {
      title: 'Chrome Browser',
      steps: [
        'Click the lock icon (🔒) or tune icon (⚙️) next to the URL in your address bar',
        'Find "Location" in the permissions list',
        'Change it from "Block" to "Allow"',
        'Refresh the page and try again'
      ],
      icon: '🔒'
    };
  } else if (userAgent.includes('Firefox')) {
    return {
      title: 'Firefox Browser',
      steps: [
        'Click the shield icon next to the URL in your address bar',
        'Click "Site Permissions"',
        'Find "Access Your Location" and change it to "Allow"',
        'Refresh the page and try again'
      ],
      icon: '🛡️'
    };
  } else if (userAgent.includes('Safari')) {
    return {
      title: 'Safari Browser',
      steps: [
        'Go to Safari > Preferences > Websites > Location',
        'Find this website in the list',
        'Change the permission to "Allow"',
        'Refresh the page and try again'
      ],
      icon: '🌐'
    };
  } else if (userAgent.includes('Edge')) {
    return {
      title: 'Microsoft Edge Browser',
      steps: [
        'Click the lock icon (🔒) next to the URL in your address bar',
        'Find "Location" in the permissions list',
        'Change it from "Block" to "Allow"',
        'Refresh the page and try again'
      ],
      icon: '🔒'
    };
  } else {
    return {
      title: 'Your Browser',
      steps: [
        'Look for location or geolocation settings in your browser',
        'Find this website in the permissions list',
        'Change the location permission to "Allow"',
        'Refresh the page and try again'
      ],
      icon: '🌐'
    };
  }
};

// Utility function to check if geolocation is supported and get permission status
export const checkGeolocationSupport = async () => {
  if (!navigator.geolocation) {
    return {
      supported: false,
      message: 'Geolocation is not supported by this browser'
    };
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      return {
        supported: true,
        permissionState: permissionStatus.state,
        message: `Geolocation permission is ${permissionStatus.state}`
      };
    } catch (error) {
      return {
        supported: true,
        permissionState: 'unknown',
        message: 'Could not check permission status'
      };
    }
  }

  return {
    supported: true,
    permissionState: 'unknown',
    message: 'Permission status not available'
  };
};

// Utility function to request location with better error handling
export const requestLocationWithFallback = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    const finalOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: position.coords,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = '';
        let errorType = 'unknown';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. You can manually enter your location or enable location permissions in your browser settings.';
            errorType = 'permission_denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again or enter your location manually.';
            errorType = 'position_unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter your location manually.';
            errorType = 'timeout';
            break;
          default:
            errorMessage = 'Unable to get your location. Please enter your location manually.';
            errorType = 'unknown';
        }
        
        reject({
          success: false,
          error: {
            code: error.code,
            message: errorMessage,
            type: errorType,
            originalError: error
          }
        });
      },
      finalOptions
    );
  });
};
