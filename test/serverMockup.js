const http = require('http');
const dgram = require('dgram');
const xml2js = require('xml2js');
const fs = require('fs');
const Buffer = require('buffer').Buffer;
// eslint-disable-next-line node/no-unpublished-require
const template = require('dot').template;

//
const onvif = require('../lib/onvif.js');
const options = {
	hostname: process.env.HOSTNAME || 'localhost',
	username: process.env.USERNAME || 'admin',
	password: process.env.PASSWORD || 'qwe1010',
	port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
};
cam = new onvif.Cam(options, () => { console.log('Init onvif camera object.'); });

const reBody = /<s:Body xmlns:xsi="http:\/\/www.w3.org\/2001\/XMLSchema-instance" xmlns:xsd="http:\/\/www.w3.org\/2001\/XMLSchema">(.*)<\/s:Body>/;
const reCommand = /<(\S*) /;
const reNS = /xmlns="http:\/\/www.onvif.org\/\S*\/(\S*)\/wsdl"/;
const __xmldir = __dirname + '/serverMockup/';
const conf = {
	port: parseInt(process.env.PORT) || 8080, // server port
	hostname: process.env.HOSTNAME || 'localhost',
	pullPointUrl: '/onvif/subscription?Idx=6',
};
const verbose = process.env.VERBOSE || false;

//
let Load_Json = JSON.parse(fs.readFileSync('./WebDataDB.json').toString());
let title = '';

// html
function header(){
	return `<head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
        <meta name="author" content="s.h">
        <title>${title}</title>
		<!--<link rel="icon" type="image/x-icon" herf="">-->
        <link rel='stylesheet' href='style.css'/>
    </head>`;
}
function live(){
	return `
		<div class="Live" xmlns="http://www.w3.org/1999/html">
			<span class="title">Live</span>
			<div id="Live_video" class="Live_video" style="height: ${video_height}; width: ${video_widht};">
				<iframe name='rtsp_video' class="rtsp_video" src="/images/live_video.png" scrolling="no"></iframe>
			</div>
		</div>
		<script>
			setInterval('rtsp_video.location.reload();',2000);
		</script>
 
		<form class="Live_Image_setting">
			<div class="Live_Streaming">

			<div class="Live_setting">
				<table class="" style="border: 0">
					<tbody class="">
						<tr>
							<th>압축 형식</th>
							<td colspan="3">
								<select class="" name="Live_Quality">
									<option value="h264">h264</option>
									<option value="h265">h265</option>
									<option value="mejpeg">mejpeg</option>
								</select>
							</td>
						</tr>

						<tr>
							<th>해상도</th>
							<td colspan="3">
								<select class="" name="Live_Quality">
									<option value="1">h264 640x480</option>
									<option value="2">h264 384x288</option>
								</select>
							</td>
						</tr>

						<tr>
							<th>FPS <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td colspan="3"><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.FPS}"></td>
						</tr>

						<tr>
							<th>Bitrate <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td colspan="3"><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.Bitrate}"></td>
						</tr>

						<tr>
							<th>Quality <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td colspan="3"><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.Quality}"></td>
						</tr>

						<tr>
							<th>GOV <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td colspan="3"><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.GOV}"></td>
						</tr>
						<tr>
							<th>Brightness <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td class="Focus_speed_Near"><img class="PTZ_controll_img Near_btn" src="images/plus.png" onclick="" alt=""></td>
							<td><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.Brightness}"></td>
							<td class="Focus_speed_Far"><img class="PTZ_controll_img Far_btn" src="images/min.png" onclick="" alt=""></td>
						</tr>
						<tr>
							<th>Contrast <span style="font-size: 8px">(0 ~ 100)</span></th>
							<td class="Focus_speed_Near"><img class="PTZ_controll_img Near_btn" src="images/plus.png" onclick="" alt=""></td>
							<td><input class="Live_setting_input" type="number" min="0" max="100" value="${Load_Json.Live.Contrast}"></td>
							<td class="Focus_speed_Far"><img class="PTZ_controll_img Far_btn" src="images/min.png" onclick="" alt=""></td>
						</tr>
					</tbody>
				</table>
			</div>

			<button onclick="alert('적용 되었습니다')">적용</button>
		</form>
		<br />


		<div class="Live_rtsp">${Load_Json.Live.rtsp_url}</div>`;
}
function PTZ(){
	return `
<div class="PTZ_control">
	<span class="title">PTZ Controlll</span>
	<div class="PT">
		<div class="PT_Fan_speed PT_Tilt">
			<table class="">
				<tbody>
					<tr>
						<th colspan="10">Fan Speed / tilt Speed</th>
					</tr>
					<tr>
						<td>&nbsp</td>
						<td>&nbsp</td>
						<td><img class="PTZ_controll_img" src="/images/arrow_up.png" alt=""></td>
					</tr>
					<tr>
						<td>&nbsp</td>
						<td><img class="PTZ_controll_img" src="/images/arrow_left.png" alt=""></td>
						<td><img class="PTZ_controll_img_red" src="/images/dot2.png" alt=""></td>
						<td><img class="PTZ_controll_img" src="/images/arrow_right.png" alt=""></td>
					</tr>
					<tr>
						<td>&nbsp</td>
						<td>&nbsp</td>
						<td><img class="PTZ_controll_img" src="/images/arrow_down.png" alt=""></td>
					</tr>
					<tr>
						<th colspan="10">Zoom Speed</th>
						<td class="Focus_speed_Near"><img class="PTZ_controll_img Wide_btn" src="/images/plus.png" alt=""></td>
						<td><input class="Live_setting_input" value="${Load_Json.PTZ.Zoom_Speed}"></td>
						<td class="Focus_speed_Far"><img class="PTZ_controll_img Tele_btn" src="images/min.png" alt=""></td>
					</tr>


					<tr>
						<th colspan="10">Focus Speed</th>
						<td class="Focus_speed_Near"><img class="PTZ_controll_img Near_btn" src="images/plus.png" onclick="" alt=""></td>
						<td><input class="Live_setting_input" value="${Load_Json.PTZ.Zoom_Speed}"></td>
						<td class="Focus_speed_Far"><img class="PTZ_controll_img Far_btn" src="images/min.png" onclick="" alt=""></td>
					</tr>

					<tr>
						<th colspan="8">Focus AF</th>
					</tr>
					<tr>
						<td><input class="PTZ_control_AF_boolean" type="checkbox">on</td>
					</tr>
					<tr>
						<td>- steps</td>
						<td>
							<select class="" name="Live_Quality">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
							</select>
						</td>

						<td><button onclick="alert('적용 되었습니다')">적용</button></td>
					</tr>

				</tbody>
			</table>
		</div>
	</div>
</div>`;
}
function system() {
	return `<div class="System_Info">
				<span class="title">System</span>
				<div class="System_Info_Camera System_div">
					<span class="PTZ_control_title">Camera</span>
					<table>
						<tbody>
							<tr>
								<th>name</th>
								<td>${ Load_Json.Camera.Name }</td>
							</tr>
							<tr>
								<th>location</th>
								<td>${ Load_Json.Camera.Location }</td>
							</tr>
							<tr>
								<th>manufacturer</th>
								<td>${ Load_Json.Camera.Manufacturer }</td>
							</tr>
							<tr>
								<th>model</th>
								<td>${ Load_Json.Camera.Model }</td>
							</tr>
							<tr>
								<th>hardware version</th>
								<td>${ Load_Json.Camera.Hardware_version }</td>
							</tr>
							<tr>
								<th>firmware version</th>
								<td>${ Load_Json.Camera.Firmware_version }</td>
							</tr>
							<tr>
								<th>divice id</th>
								<td>${ Load_Json.Camera.Divice_id }</td>
							</tr>
							<tr>
								<th>mac address</th>
								<td>${ Load_Json.Camera.Mac_Address }</td>
							</tr>
							<tr>
								<th>onvif version</th>
								<td>${ Load_Json.Camera.Onvif_version }</td>
							</tr>
							<tr>
								<th>uri</th>
								<td>${ Load_Json.Live.rtsp_url }</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="System_Info_Network System_div">
					<span class="PTZ_control_title">Network</span>
					<table>
						<tbody>
							<tr>
								<th>IP Address</th>
								<td>${ Load_Json.Network.IP_Address }</td>
							</tr>
							<tr>
								<th>Subnet Mask</th>
								<td>${ Load_Json.Network.Subnet_Mask }</td>
							</tr>
							<tr>
								<th>Default Gateway</th>
								<td>${ Load_Json.Network.Default_Gateway }</td>
							</tr>
						</tbody>
					</table>
				</div>

				<form class="">
					<div class="System_Info_User System_div">
						<span class="PTZ_control_title">User</span>
						<table>
							<tbody>
								<tr>
									<th>ID</th>
									<td>${ Load_Json.User.ID }</td>
								</tr>
								<tr>
									<th>Password</th>
									<td><input class="" style="border: 0" type="password" value="${ Load_Json.User.Password }"></td>
								</tr>
								<tr>
									<td class="black_btn" onclick="alert('적용 되었습니다')">Update</td>
								</tr>
							</tbody>
						</table>
					</div>
				</form>

				<div class="System_Info_System System_div">
					<span class="PTZ_control_title">System</span>
					<table>
						<tbody>
							<tr>
								<th>time zone</th>
								<td><div class="time_set"></div></td>
							</tr>
							<tr>
								<td class="black_btn">time setting</td>
								<td class="">
									<select class="" name="time_setting">
										<option value="GMT0">GMT +0</option>
										<option value="GMT1">GMT +1</option>
										<option value="GMT2">GMT +2</option>
										<option value="GMT3">GMT +3</option>
										<option value="GMT4">GMT +4</option>
										<option value="GMT5">GMT +5</option>
										<option value="GMT6">GMT +6</option>
										<option value="GMT7">GMT +7</option>
										<option value="GMT8">GMT +8</option>
										<option value="GMT9">GMT +9</option>
										<option value="GMT10">GMT +10</option>
										<option value="GMT11">GMT +11</option>
										<option value="GMT12">GMT +12</option>
									</select>
								</td>
							</tr>
							<tr>
								<td class="black_btn" onclick="alert('리셋 적용이 완료되었습니다')">Soft reset</td>
							</tr>
							<tr>
								<td class="black_btn" onclick="alert('리셋 적용이 완료되었습니다')">Hard reset</td>
							</tr>
							<tr>
								<td class="red_btn"  onclick="alert('리부트를 시작합니다')">Reboot</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
<!--IE 10이하 지원 안함-->
<!--<script>-->
<!--const clock = document.getElementsByClassName('time_set')[0];-->


<!--function getTime(){-->
<!--const time = new Date();-->
<!--const hour = time.getHours();-->
<!--const minutes = time.getMinutes(); -->
<!--const seconds = time.getSeconds();-->
<!--clock.innerText = hour +":" + minutes + ":"+seconds; -->
<!--}-->

<!--function init(){-->
<!--setInterval(getTime, 1000);-->
<!--}-->

<!--init();-->
<!--</script>-->`;
}
//html end

//img routing
function public_files(req,res){
	if (req.url === '/style.css') {
		res.writeHead(200,{'Content-Type': 'text/css;'});
		res.write(fs.readFileSync('./test/public/stylesheets/style.css').toString());

		return res.end();
	}
	if (req.url === '/images/arrow_up.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/arrow_up.png'));

		return res.end();
	}
	if (req.url === '/images/arrow_down.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/arrow_down.png'));

		return res.end();
	}
	if (req.url === '/images/arrow_left.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/arrow_left.png'));

		return res.end();
	}
	if (req.url === '/images/arrow_right.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/arrow_right.png'));

		return res.end();
	}

	if (req.url === '/images/dot2.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/dot2.png'));

		return res.end();
	}
	if (req.url === '/images/min.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/min.png'));

		return res.end();
	}
	if (req.url === '/images/plus.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/plus.png'));

		return res.end();
	}
	if (req.url === '/images/ptz.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/ptz.png'));

		return res.end();
	}
	if (req.url === '/images/live_video2.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/ptz.png'));

		return res.end();
	}

	if (req.url === '/images/live_video.png') {
		res.writeHead(200,{'Content-Type': 'image/png;'});
		res.write(fs.readFileSync('./test/public/images/live_video.png'));
		return res.end();
	}
}

const listener = (req, res) => {
	title = 'set_title';
	//set json
	Load_Json.Live.rtsp_url = 'rtsp://192.168.0.129:554/live4.sdp';
	Load_Json.Camera = {
		"Name": "HK380",
		"Location": "Korea",
		"Manufacturer": "OZRAY",
		"Model": "HK380-8",
		"Hardware_version": "1.0",
		"Firmware_version": "1.0",
		"Device_id": "1234",
		"Mac_Address": "",
		"Onvif_version": ""
	};
	Load_Json.Network = {
		"IP_Address": "192.168.0.129",
		"Subnet_Mask": "255.255.255.0",
		"Default_Gateway": "192.168.0.1"
	};
	video_height=320;
	video_widht=320;

	public_files(req, res);

	//router
	if (req.url === '/') {
		res.write(header());
		// set html
		res.write(live());
		res.write(PTZ());
		res.write(system());

		return res.end();
	}

	req.setEncoding('utf8');
	const buf = [];
	req.on('data', (chunk) => buf.push(chunk));
	req.on('end', () => {
		let request;

		if (Buffer.isBuffer(buf)) {
			request = Buffer.concat(buf);
		} else {
			request = buf.join('');
		}
		// Find body and command name
		const body = reBody.exec(request);
		if (!body) {
			return res.end();
		}
		const header = body[1];
		let command = reCommand.exec(header)[1];
		if (!command) {
			return res.end();
		}
		//
		//if (verbose)
		// eslint-disable-next-line no-mixed-spaces-and-tabs
	    // 	console.log('body: ', body);
		// Look for ONVIF namespaces
		const onvifNamespaces = reNS.exec(header);
		let ns = '';
		if (onvifNamespaces) {
			ns = onvifNamespaces[1];
		}
		if (verbose) {
			//console.log('header: ', header);
			if (command !== 'Renew' && command !== 'Unsubscribe' && command !== 'PullMessages') {console.log('received: ', ns, command, req.url);}
		}
		
		//Parsing and handle it
		if (command === 'GetSystemDateAndTime') {
			cam.putSystemDateAndTime((err, dateTime, xml) => { 
				console.log('GetSystemDateAndTime: ', xml);
				res.setHeader('Content-Type', 'application/soap+xml;charset=UTF-8');
				res.end(template(xml)(conf));
			});
		} else if (command === 'GetNetworkDefaultGateway') {
			cam.putEmptyResponse((err, dateTime, xml) => { 
				console.log('GetNetworkDefaultGateway: ', xml); 
				res.setHeader('Content-Type', 'application/soap+xml;charset=UTF-8');
				res.end(template(xml)(conf));
			});
		} else if (command === 'GetDiscoveryMode') {
			cam.putEmptyResponse((err, dateTime, xml) => { 
				console.log('GetDiscoveryMode: ', xml); 
				res.setHeader('Content-Type', 'application/soap+xml;charset=UTF-8');
				res.end(template(xml)(conf));
			});
		}

		// else if (command === 'GetStreamUri') {
		// 	cam.putEmptyResponse((err, dateTime, xml) => {
		// 		console.log('GetStreamUri: ', xml);
		// 		res.setHeader('Content-Type', 'application/soap+xml;charset=UTF-8');
		// 		res.end(template(xml)(conf));
		// 	});
		// }

		//Send default xml
		else {
			//Exist
			if (fs.existsSync(__xmldir + ns + '.' + command + '.xml')) {
				//
				command = ns + '.' + command;
			}
			if (!fs.existsSync(__xmldir + command + '.xml')) {
				command = 'Error';
			}
			//Return response
			let fileName = __xmldir + command + '.xml';

			res.setHeader('Content-Type', 'application/soap+xml;charset=UTF-8');
			res.end(template(fs.readFileSync(fileName))(conf));

			// if (verbose) {
			// 	console.log('serving', fileName);
			// 	console.log('');
			//
			// 	if (command == 'media.GetVideoSourceConfiguration'){
			// 		console.log(fs.readFileSync(fileName, {encoding:'utf8', flag:'r'}));
			// 	}
			// 	if (command == 'events.CreatePullPointSubscription') {
			// 		console.log(fs.readFileSync(fileName, {encoding:'utf8', flag:'r'}));
			// 	}
			// }
		}
		//After
		if (command !== 'Renew' && command !== 'Unsubscribe' && command !== 'PullMessages') {console.log('handled: ', ns, command, req.url );}
	});
};

// Discovery service
const discoverReply = dgram.createSocket('udp4');
const discover = dgram.createSocket({ type: 'udp4', reuseAddr: true });
discover.on('error', (err) => { throw err; });
discover.on('message', (msg, rinfo) => {
	// if (verbose) {
	// 	console.log('Discovery received: ', msg, ',', rinfo);
	// }
	// Extract MessageTo from the XML. xml2ns options remove the namespace tags and ensure element character content is accessed with '_'
	xml2js.parseString(msg.toString(), { explicitCharkey: true, tagNameProcessors: [xml2js.processors.stripPrefix]}, (err, result) => {
		const msgId = result.Envelope.Header[0].MessageID[0]._;
		const discoverMsg = Buffer.from(fs
			.readFileSync(__xmldir + 'Probe.xml')
			.toString()
			.replace('RELATES_TO', msgId)
			.replace('SERVICE_URI', 'http://' + conf.hostname + ':' + conf.port + '/onvif/device_service')
		);

		// if (verbose) {
		// 	console.log('discoverMsg: ', discoverMsg, ',', msgId);
		// }

		switch (msgId) {
			// Wrong message test
			case 'urn:uuid:e7707': discoverReply.send(Buffer.from('lollipop'), 0, 8, rinfo.port, rinfo.address);
				break;
			// Double sending test
			case 'urn:uuid:d0-61e':
				discoverReply.send(discoverMsg, 0, discoverMsg.length, rinfo.port, rinfo.address);
				discoverReply.send(discoverMsg, 0, discoverMsg.length, rinfo.port, rinfo.address);
				break;
			default: discoverReply.send(discoverMsg, 0, discoverMsg.length, rinfo.port, rinfo.address);
		}
	});
});

if (verbose) {
	console.log('Listening for Discovery Messages on Port 3702');
}

discover.bind(3702, () => discover.addMembership('239.255.255.250'));

const server = http.createServer(listener).listen(conf.port, (err) => {
	if (err) {
		throw err;
	}
	if (verbose) {
		console.log('Listening on port', conf.port);
	}
});

const close = () => {
	discover.close();
	discoverReply.close();
	server.close();
	if (verbose) {
		console.log('Closing ServerMockup');
	}
};

module.exports = {
	server: server,
	conf: conf,
	discover: discover,
	close: close,
};
