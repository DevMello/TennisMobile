import React from 'react';
import { Page, Navbar, Block, List, ListItem, Button, Toolbar } from 'konsta/react';
import { Battery, BatteryCharging, Bluetooth, Folder, AppWindow, Wrench, ChevronRight, ChevronDown, CircleUserRound } from 'lucide-react';
import { Link} from 'react-router-dom';

export function Home() {

  return (
    
    <Page className="text-white">
      {/* Top Section */}
      <div className='bg-gray-900'>
      <div className="bg-blue-500 p-4 rounded-b-3xl">
        <div className="text-right">
          <h1 className="text-4xl font-bold dark:text-white">Tennis Assistant</h1>
          <h2 className="text-2xl">Aryan</h2>
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
        <Button large className="w-full bg-blue-500 text-white k-color-brand-blue mt-4">
          START
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
          <span className="text-blue-500 dark:text-blue-400">Connect</span>
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
