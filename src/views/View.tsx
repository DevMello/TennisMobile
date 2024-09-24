import React, { useEffect, useState } from 'react';
import { BleClient } from '@capacitor-community/bluetooth-le';

const BLE_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';  // Your service UUID
const BLE_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';  // Your characteristic UUID

export function View() {
  const [device, setDevice] = useState(null);
  const [dataChunks, setDataChunks] = useState([]);
  const [log, setLog] = useState('');

  const connectToDevice = async (deviceId) => {
    try {
      await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
      console.log('Connected to device', deviceId);
      setDevice(deviceId);

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
        setLog((prevLog) => prevLog + value.getUint32(0, true) + '\n');
      }
    );
  };

  const onDisconnect = (deviceId) => {
    console.log(`Device ${deviceId} disconnected`);
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
    } catch (error) {
      console.error("Error while stopping server:", error);
    }
  };

  return (
    <div className="home">
      <h1>BLE Log Reader</h1>
      {device ? (
        <>
          <p>Connected to {device.name}</p>
          <button onClick={handleStartServer}>Start Server</button>
          <button onClick={handleStopServer}>Stop Server</button>
        </>
      ) : (
        <button onClick={handleConnect}>Connect to Device</button>
      )}

      <h2>Log:</h2>
      <textarea
        value={log}
        readOnly
        rows={10}
        cols={50}
      />
    </div>
  );
}
