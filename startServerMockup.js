// Run the Server Mockup

let ip = require('ip');

let serverHostname = ip.address();
let serverPort = '8080';
let allowDiscovery = 'true';

process.env['HOSTNAME'] = serverHostname;
process.env['PORT'] = serverPort;
process.env['VERBOSE'] = 'false';

// console.log('Starting Server Mockup at http://' + serverHostname + ':' + serverPort + '/onvif/device_service');
console.log('Starting Server Mockup at http://' + serverHostname + ':' + serverPort);

let serverMockup = require('./test/serverMockup.js')

// ServerMockup keeps running until you call .close()

// serverMockup.close()

