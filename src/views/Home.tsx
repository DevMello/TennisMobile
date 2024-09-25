import React, { useEffect, useState } from 'react';
import { Page, Navbar, Block, List, ListItem, Button, Toolbar } from 'konsta/react';
import { Battery, BatteryCharging, Bluetooth, Folder, AppWindow, Wrench, ChevronRight, ChevronDown, CircleUserRound } from 'lucide-react';
import { Wifi } from 'ln-capacitor-wifi';
import { Link} from 'react-router-dom';
import { BleClient } from '@capacitor-community/bluetooth-le';
import axios from 'axios';

const BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';  // Your service UUID
const BLE_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';  // Your characteristic UUID

export function Home() {

  const [device, setDevice] = useState(null);
  const [dataChunks, setDataChunks] = useState([]);
  const [name, setName] = useState("Not Connected");
  const [webServer, setWebServer] = useState(false);

  const connectToWifi = async () => {
    await Wifi.checkPermissions().then((result) => {
      if (result) {
        console.log('Permissions granted');
      } else {
        console.log('No permissions');
        Wifi.requestPermissions().then((result) => {
          if (result) {
            console.log('Permissions granted');
          } else {
            console.log('No permissions');
            return;
          }
        });
      }
      // sleep for 3 seconds to wait for wifi start up
      setTimeout(async () => {
        await Wifi.connectToWifiBySsidAndPassword({
          ssid: 'DataLog',
          password: ''
        }).then(async (result) => {
          if (result.wasSuccess) {
            console.log('Connected to wifi');
            await Wifi.getCurrentWifi().then((result) => {
              console.log('Connected to wifi:', result.currentWifi?.ssid);
              if (result.currentWifi) {
                setTimeout(() => {
                  //download the csv file at http://192.168.4.1/shots.csv
                  axios.get('http://192.168.4.1/shots.csv', {
                    responseType: 'blob', // Handle the CSV file as a binary Blob
                }).then((response) => {
                    const reader = new FileReader();
                    
                    // Convert the blob to text
                    reader.onload = () => {
                        console.log(reader.result); // Log the CSV content as text
                    };
                    
                    // Read the Blob data as text
                    reader.readAsText(response.data);
                    
                }).catch((error) => {
                    console.error("Fetch error: ", error);
                });
                }, 4000);
              }
            });

            // setTimeout(() => {
            //   //disconnect from wifi
            //   disconnect();
            //   //handleStopServer();
            // }, 10000);
            
            
          } else {
            console.log('Failed to connect to wifi');
          }
        }
        );
      }, 3000);
    });
  }



  const disconnect = async () => {
    Wifi.disconnectAndForget();
  }

  const connectToDevice = async (deviceId) => {
    try {
      await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
      console.log('Connected to device', deviceId);
      setDevice(deviceId);
      setName('Connected');

      // Start listening to notifications
      await startListen(deviceId);
    } catch (error) {
      console.error("Error while connecting to device:", error);
    }
  };

  const startListen = async (deviceId: string) => {
    await BleClient.startNotifications(
      deviceId,
      BLE_SERVICE_UUID,
      BLE_CHARACTERISTIC_UUID,
      (value) => {
        console.log('Characteristic data received: ', value.getUint32(0, true));
        setDataChunks((prevChunks) => [...prevChunks, value.getUint32(0, true)]);
      }
    );
  };

  const onDisconnect = (deviceId: string) => {
    console.log(`Device ${deviceId} disconnected`);
    setName('Not Connected');
    setDevice(null);
  };

  useEffect(() => {
    const initializeBLE = async () => {
      await BleClient.initialize({ androidNeverForLocation: true });
      await scanForDevices();
    };

    const scanForDevices = async () => {
      try {
        await BleClient.requestLEScan({}, (result) => {
          console.log('Received new scan result', result);
        });

        setTimeout(async () => {
          await BleClient.stopLEScan();
          console.log('Stopped scanning');
        }, 5000);
      } catch (error) {
        console.error("Error while scanning for devices:", error);
      }
    };

    initializeBLE();

    return () => {
      // Cleanup can be added here if necessary
    };
  }, []);

  const handleConnect = async () => {
    try {
      const device = await BleClient.requestDevice();
      await connectToDevice(device.deviceId);
    } catch (error) {
      console.error("Error while connecting to device:", error);
    }
  };

  const handleStartServer = async () => {
    if (!device) {
      console.error("No device connected");
      return;
    }
    try {
      const bufferSize = 20;
      const buffer = new ArrayBuffer(bufferSize);
      const dataView = new DataView(buffer);
      dataView.setUint8(0, 1); // Value to turn the server on
      await BleClient.write(device, BLE_SERVICE_UUID, BLE_CHARACTERISTIC_UUID, dataView);
      console.log("Server started");
      setWebServer(true);
    } catch (error) {
      console.error("Error while starting server:", error);
    }
  };

  const handleStopServer = async () => {
    if (!device) {
      console.error("No device connected");
      return;
    }
    try {
      const bufferSize = 20;
      const buffer = new ArrayBuffer(bufferSize);
      const dataView = new DataView(buffer);
      dataView.setUint8(0, 0); // Value to turn the server off
      await BleClient.write(device, BLE_SERVICE_UUID, BLE_CHARACTERISTIC_UUID, dataView);
      console.log("Server stopped");
      setWebServer(false);
    } catch (error) {
      console.error("Error while stopping server:", error);
    }
  };

  const handleGetData = async () => {
    await handleStartServer();
    await connectToWifi();
  };


  return (
    
    <Page className="text-white">
      {/* Top Section */}
      <div className='bg-gray-900'>
      <div className="bg-blue-500 p-4 rounded-b-3xl">
        <div className="text-right">
          <h1 className="text-4xl font-bold dark:text-white">Tennis Assistant</h1>
          <h2 className="text-2xl">
            {name}
          </h2>
          <div className="flex items-center justify-end space-x-2">
            <Battery className="w-6 h-6 " />
            <span className="text-xl">8%</span>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <Block className="space-y-4 pb-20">

      {/* Start Game Session */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold dark:text-white">Game Session</h3>
        <p className="text-gray-500 dark:text-gray-300">
          Enable to start a new game session. This will record new data and reset previous data.
        </p>
        <Button large className="w-full bg-blue-500 text-white k-color-brand-blue mt-4" onClick={handleConnect}>
          CONNECT
        </Button>
      </div>
        {/* Pull Data*/}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold dark:text-white">Download Latest Data</h3>
        <p className="text-gray-500 dark:text-gray-300">
          Download the latest data from the device.
        </p>
        <Button large className="w-full bg-blue-500 text-white k-color-brand-blue mt-4" onClick={handleGetData} id="get">
          GET
        </Button>
      </div>

        {/* Firmware Update */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold dark:text-white">Firmware Update</h3>
            <Button roundedIos small outline>What's New</Button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="dark:text-gray-300">Update Channel</span>
            <button className="text-green-500 inline-flex items-center px-2 py-1 rounded hover:text-green-700 transition">
              Release 1.0.1 <ChevronDown className="ml-1" />
            </button>
          </div>
          <Button large className="w-full bg-orange-500 text-white k-color-brand-orange">
            INSTALL
          </Button>
          <p className="text-sm text-center mt-2 text-gray-500">
            Firmware on Flipper doesn't match update channel.
            Selected version will be installed.
          </p>
        </div>

        {/* Device Info */}
        
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="text-xl font-bold dark:text-white">Device Info</h3>
          <div className="flex justify-between dark:text-gray-300">
            <span>Firmware Version</span>
            <span className="text-red-500">Dev 65d89f2a</span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Build Date</span>
            <span>02-09-2024</span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>SD Card (Used/Total)</span>
            <span>28.8 GiB / 59.5 GiB</span>
          </div>
        </div>
      </Block>

      <Toolbar
        top={false}
        className={`left-0 bottom-0 fixed w-full dark mb-0`}
      >
        <Link className="flex flex-col items-center" to="/view" >
          <Bluetooth className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <span className="text-blue-500 dark:text-blue-400">Home</span>
        </Link>
        <Link className="flex flex-col items-center" to=''>
          <Folder className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Data</span>
        </Link>
        <Link to='' className="flex flex-col items-center">
          <Wrench className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Settings</span>
        </Link>
        <Link to='' className="flex flex-col items-center" >
          <CircleUserRound className="w-6 h-6 dark:text-white" />
          <span className="dark:text-gray-300">Profile</span>
        </Link>
      </Toolbar>
      </div>
    </Page>
    
  );
}
