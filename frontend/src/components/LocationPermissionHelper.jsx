import React, { useState, useEffect } from 'react';

const LocationPermissionHelper = ({ onLocationObtained, onPermissionDenied }) => {
  const [permissionState, setPermissionState] = useState('unknown');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(permissionStatus.state);
        
        // Listen for permission changes
        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state);
        };
      } catch (error) {
        console.warn('Could not check permission status:', error);
        setPermissionState('unknown');
      }
    } else {
      setPermissionState('unknown');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsRequesting(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained successfully:', position.coords);
        setIsRequesting(false);
        onLocationObtained?.(position.coords);
      },
      (error) => {
        console.warn('Could not get location:', error);
        setIsRequesting(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState('denied');
          onPermissionDenied?.();
        }
      },
      options
    );
  };

  const getInstructionsForBrowser = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      return {
        title: 'Chrome Browser',
        steps: [
          'Click the lock icon (🔒) or tune icon (⚙️) next to the URL in your address bar',
          'Find "Location" in the permissions list',
          'Change it from "Block" to "Allow"',
          'Refresh the page and try again'
        ]
      };
    } else if (userAgent.includes('Firefox')) {
      return {
        title: 'Firefox Browser',
        steps: [
          'Click the shield icon next to the URL in your address bar',
          'Click "Site Permissions"',
          'Find "Access Your Location" and change it to "Allow"',
          'Refresh the page and try again'
        ]
      };
    } else if (userAgent.includes('Safari')) {
      return {
        title: 'Safari Browser',
        steps: [
          'Go to Safari > Preferences > Websites > Location',
          'Find this website in the list',
          'Change the permission to "Allow"',
          'Refresh the page and try again'
        ]
      };
    } else {
      return {
        title: 'Your Browser',
        steps: [
          'Look for location or geolocation settings in your browser',
          'Find this website in the permissions list',
          'Change the location permission to "Allow"',
          'Refresh the page and try again'
        ]
      };
    }
  };

  const instructions = getInstructionsForBrowser();

  if (permissionState === 'denied') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Location Access Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                To automatically fill your location, we need permission to access your device's location.
                Your browser has blocked this permission.
              </p>
              
              {!showInstructions ? (
                <button
                  onClick={() => setShowInstructions(true)}
                  className="mt-2 text-yellow-800 underline hover:text-yellow-900"
                >
                  How to enable location access
                </button>
              ) : (
                <div className="mt-3">
                  <h4 className="font-medium mb-2">{instructions.title}</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="mt-2 text-yellow-800 underline hover:text-yellow-900"
                  >
                    Hide instructions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionState === 'granted') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Location access is enabled. Your location will be automatically filled when you submit the form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Location Access
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              We can automatically fill your location when you submit the form. 
              This helps us provide better service and accurate issue tracking.
            </p>
            <button
              onClick={requestLocation}
              disabled={isRequesting}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting location...
                </>
              ) : (
                'Enable location access'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionHelper;
