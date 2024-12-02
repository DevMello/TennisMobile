import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, Button, Toolbar } from 'konsta/react';
import { Battery, Folder, Wrench, CircleUserRound } from 'lucide-react';
import { Wifi } from 'ln-capacitor-wifi';
import axios from 'axios';
import { Link } from 'react-router-dom';
export function Home() {
  const [deviceStatus, setDeviceStatus] = useState("Not Connected");
  const [wifiConnected, setWifiConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [csvData, setCsvData] = useState(null);

  // Check Wi-Fi status and device info on page load
  useEffect(() => {
    const initializeApp = async () => {
      const isWifiConnected = await checkWifiConnection();
      if (isWifiConnected) {
        await fetchDeviceInfo();
      }
    };

    initializeApp();
  }, []);

  const checkWifiConnection = async () => {
    try {
      // Try to fetch health endpoint from the device
      const response = await axios.get('http://192.168.4.1/health');
      
      if (response.status === 200 && response.data) {
        // If we get a valid response, the device is reachable and working
        setWifiConnected(true);
        console.log('Device is connected and healthy:', response.data);
        return true;
      } else {
        // If response is not valid, device is not reachable
        setWifiConnected(false);
        console.log('Device not reachable');
        return false;
      }
    } catch (error) {
      // Handle any errors (e.g., network issues)
      console.error("Error checking WiFi status:", error);
      setWifiConnected(false);
      return false;
    }
  };

  const connectToWifi = async () => {
    const permissionGranted = await Wifi.checkPermissions();
    if (!permissionGranted) {
      console.log('Requesting WiFi permissions...');
      await Wifi.requestPermissions();
    }
    
    const connected = await Wifi.connectToWifiBySsidAndPassword({
      ssid: 'DataLog',
      password: ''
    });

    if (connected.wasSuccess) {
      console.log('Connected to wifi');
      setWifiConnected(true);
    } else {
      console.log('Failed to connect to wifi');
    }
  };

  const fetchDeviceInfo = async () => {
    try {
      const response = await axios.get('http://192.168.4.1/health');
      setDeviceInfo(response.data);
      
      console.log('Device info fetched:', response.data);
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
  };

  const handleStartSession = async () => {
    if (!wifiConnected) {
      console.log("Not connected to WiFi.");
      return;
    }
    try {
      await axios.post('http://192.168.4.1/start');
      console.log('Game session started');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleStopSession = async () => {
    if (!wifiConnected) {
      console.log("Not connected to WiFi.");
      return;
    }
    try {
      await axios.post('http://192.168.4.1/stop');
      console.log('Game session stopped');
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  const handleResetIMU = async () => {
    if (!wifiConnected) {
      console.log("Not connected to WiFi.");
      return;
    }
    try {
      await axios.post('http://192.168.4.1/reset_imu');
      console.log('IMU reset');
    } catch (error) {
      console.error('Error resetting IMU:', error);
    }
  };

  const fetchCsvData = async () => {
    if (!wifiConnected) {
      console.log("Not connected to WiFi.");
      return;
    }
    try {
      const response = await axios.get('http://192.168.4.1/data', {
        responseType: 'blob' // Ensure the data is returned as a Blob
      });
      
      // Create a link element to trigger the download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'device_data.csv'; // Name the file to be downloaded
      link.click(); // Trigger the download
  
      console.log("CSV data downloaded");
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  };
  function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    let formattedBytes = bytes;
  
    while (formattedBytes >= 1024 && unitIndex < units.length - 1) {
      formattedBytes /= 1024;
      unitIndex++;
    }
  
    return `${formattedBytes.toFixed(2)} ${units[unitIndex]}`;
  }
  

  return (
    <Page className="text-white">
      {/* Top Section */}
      <div className="bg-blue-500 p-4 rounded-b-3xl">
        <div className="text-right">
          <h1 className="text-4xl font-bold dark:text-white">Tennis Assistant</h1>
          <h2 className="text-2xl">
            {wifiConnected ? 'Connected' : 'Not Connected'}
          </h2>
          <div className="flex items-center justify-end space-x-2">
            <Battery className="w-6 h-6" />
            <span className="text-xl">100%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Block className="space-y-4 pb-20">
        {/* Game Session */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold dark:text-white">Game Session</h3>
          <p className="text-gray-500 dark:text-gray-300">
            Enable to start a new game session. This will record new data and reset previous data.
          </p>
          <Button large className="w-full bg-blue-500 text-white mt-4" onClick={handleStartSession}>
            START
          </Button>
          <Button large className="w-full bg-red-500 text-white mt-4" onClick={handleStopSession}>
            STOP
          </Button>
          <Button large className="w-full bg-gray-500 text-white mt-4" onClick={handleResetIMU}>
            RESET IMU
          </Button>
        </div>

        {/* Device Info */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="text-xl font-bold dark:text-white">Device Info</h3>
            {deviceInfo ? (
              <>
                <div className="flex justify-between dark:text-gray-300">
                  <span>Firmware Version</span>
                  <span className="text-red-500">{deviceInfo.version}</span>
                </div>
                <div className="flex justify-between dark:text-gray-300">
                  <span>Battery</span>
                  <span>{deviceInfo.battery}%</span>
                </div>

                {/* SD Card (Used/Total) - formatted */}
                <div className="flex justify-between dark:text-gray-300">
                  <span>SD Card (Free/Total)</span>
                  <span>
                    {deviceInfo.sd_card && deviceInfo.sd_card.includes('/') ? (
                      // Split used/total values and format them
                      <>
                        {deviceInfo.sd_card.split('/').map((value, index) => (
                          <span key={index}>
                            {formatBytes(Number(value.trim()))}
                            {index === 0 ? ' / ' : ''}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span>{deviceInfo.sd_card}</span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">No device info available.</span>
            )}
        </div>

        {/* Download Latest Data */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold dark:text-white">Download Latest Data</h3>
          <p className="text-gray-500 dark:text-gray-300">
            Download the latest data from the device.
          </p>
          <Button large className="w-full bg-blue-500 text-white mt-4" onClick={fetchCsvData}>
            GET
          </Button>
        </div>
      </Block>

      {/* Render CSV Data as Popup */}
      {csvData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg max-w-lg">
            <h2 className="text-xl font-bold">CSV Data</h2>
            <pre className="whitespace-pre-wrap">{csvData}</pre>
            <Button className="mt-4 bg-red-500 text-white" onClick={() => setCsvData(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <Toolbar
        top={false}
        className={`left-0 bottom-0 fixed w-full mb-0`}
      >
        <Link className="flex flex-col items-center" to="/view">
          <Folder className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Data</span>
        </Link>
        <Link to="" className="flex flex-col items-center">
          <Wrench className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Settings</span>
        </Link>
        <Link to="" className="flex flex-col items-center">
          <CircleUserRound className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Profile</span>
        </Link>
      </Toolbar>
    </Page>
  );
}
