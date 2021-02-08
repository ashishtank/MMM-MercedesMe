# MMM-MercedesMe
This an extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). It can display your Mercedes car electic/fuel and range on Magic Mirror<sup>2</sup>. You can add multiple instances with different Mercedes cars.

![MMM-MercedesMe Screenshot](screenshots/singledial.gif?raw=true "Title 1")
![MMM-MercedesMe Screenshot](screenshots/twodial.gif?raw=true "Title 2")

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/ashishtank/MMM-MercedesMe.git`. A new folder should appear.

````
git clone https://github.com/ashishtank/MMM-MercedesMe.git
```` 
2. No need for npm install as it uses depencies from Magic Mirror<sup>2</sup> core.
3. You need minimum Magic Mirror version `2.14.0` for this module to work.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-MercedesMe',
		position: 'bottom_right',	// This can be any of the regions. Best results in left or right regions.
		header: 'My Mercedes', // This is optional
		config: {
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuring App and Retrieving API Token
*There is mandatory MercedesMe registration required, you may use your Mercedes Me credentials*

### Go to [Developer.MercedesMe](https://developer.mercedes-benz.com/console). Follow below steps:

1. Click on Add New App and fill below details.
  ```
  Application Name: My Mirror App
  Purpose URL: https://github.com/ashishtank/MMM-MercedesMe
  Business Purpose : BYOC (Bring your own car) you can write any thing here
  AUTH CALLBACK URL: http://localhost
  ```
  ![MMM-MercedesMe Screenshot](screenshots/appregistration.png?raw=true "App registration")

2. Hit ***create*** and you'll be displayed your `App ID`.
![MMM-MercedesMe Screenshot](screenshots/registeredapp.png?raw=true "App registration done")

3. Now go to [Electric Vehicle](https://developer.mercedes-benz.com/products/electric_vehicle_status/get_access?pm=free) or [Vehicle Status](https://developer.mercedes-benz.com/products/vehicle_status/get_access?pm=free) to subscribe to your car status for Mirror App based on your car type, if you have multiple cars you can subscribe to them in this single app as well.

4. Make sure Mirror app is selected in the subscribe list and click on ***subscribe***
![MMM-MercedesMe Screenshot](screenshots/evstatus-subscribe.png?raw=true "Electric Vehicle subscribe")

5. It should display below confirmation window, click on ***view in console***
![MMM-MercedesMe Screenshot](screenshots/subscribe-success.png?raw=true "Subscribe Success")

6. In console it should show you app with electic vehicle or vehicle subscription as below with `client id` and `client secret`
![MMM-MercedesMe Screenshot](screenshots/appwithevstatus.png?raw=true "App with client id and client secret")

7. We will need to add correct redirect url here, click on + button next to redirect urls and redirect url `http://localhost:8080/MMM-MercedesMe/callback`. This is local url of Magic Mirror as we will get token on mirror only.
![MMM-MercedesMe Screenshot](screenshots/appwithcallbackurl.png?raw=true "App with redirect url")

8. Press Ok icon as shown in image above to add the callback url to app.
![MMM-MercedesMe Screenshot](screenshots/redirecturls.png?raw=true "App with redirect url")

9. Now configure the module with below Configuration options, we will get the token in few next steps

## Configuration options

The following properties can be configured:


<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>clientID</code></td>
			<td>Your MercedesMe Mirror App client id, you can get it <a href="https://developer.mercedes-benz.com/console">here</a>.<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>none</code>
        <br><b>This value is mandatory</b>
			</td>
		</tr>
    <tr>
			<td><code>client secret</code></td>
			<td>Your MercedesMe Mirror App client secret, you can get it <a href="https://developer.mercedes-benz.com/console">here</a>.<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>none</code>
        <br><b>This value is mandatory</b>
			</td>
		</tr>
    <tr>
			<td><code>vehicleId</code></td>
			<td>Your Mercedes Vehicle id can be VIN or FIN.<br>
				<br><b>Possible values:</b> <code>string</code>
				<br><b>Default value:</b> <code>none</code>
        <br><b>This value is mandatory</b>
			</td>
		</tr>
		<tr>
			<td><code>vehicleType</code></td>
			<td>Vehicle type, based on your vehicle type correct subscription in mirror app is needed i.e. Electrive Vehicle or Vehicle status<br>
				<br><b>Possible values:</b> <code>Electric</code>, <code>Petrol</code>, <code>Diesel</code>
				<br><b>Default value:</b> <code>Electric</code>
			</td>
		</tr>
    <tr>
			<td><code>scope</code></td>
			<td>Scope, only needed if vehicle is not an electic car<br>
				<br><b>Possible values:</b> <code>mb:vehicle:mbdata:evstatus offline_access</code> or <code>mb:vehicle:mbdata:vehiclestatus  offline_access</code> or both
				<br><b>Default value:</b> <code>mb:vehicle:mbdata:evstatus offline_access</code>
			</td>
		</tr>
		<tr>
			<td><code>displayStyle</code></td>
			<td>Display style of vehicle data on Magic Mirror<sup>2</sup>.<br>
				<br><b>Possible values:</b> <code>singledial</code>, <code>twodial</code>
				<br><b>Default value:</b> <code>singledial</code>
			</td>
		</tr>
		<tr>
			<td><code>maxRange</code></td>
			<td>Maximum range of your vehicle, it is used in two dial display style to show correct prgoress for range<br>
				<br><b>Possible values:</b> <code>number</code>
				<br><b>Default value:</b> <code>100</code>
			</td>
		</tr>
    <tr>
			<td><code>updateInterval</code></td>
			<td>Update interval for refreshing the car data in milliseconds<br>
				<br><b>Possible values:</b> <code>number</code>
				<br><b>Default value:</b> <code>300000</code> i.e. 5 Minutes
			</td>
		</tr>
		<tr>
			<td><code>debug</code></td>
			<td>Debug mode, used for troubleshooting<br>
				<br><b>Possible values:</b> <code>true</code> or <code>false</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
	</tbody>
</table>

### Example configuration

````javascript
modules: [
    {
      module: 'MMM-MercedesMe',
      position: 'bottom_right',
      header: 'My Mercedes',
      config: {
              client_id: '8cebe85d-ca20-486d-ad5f-cf25cae61eeb',
              client_secret: 'VvzJfpOLTZkByzOAqvMcIobgswYulbOeDuTkmhDHAwVjMAOENBGiEkrGWXKkrtYv',
              vehicleType: 'Electric',
              vehicleId: 'WDB111111ZZZ22222',
              displayStyle: 'twodial',
              maxRange: 110
      }
    }
]
````

After configuring like shown above, run Magic Mirror
1. It should show you `Authenticate` link as shown below.

![MMM-MercedesMe Screenshot](screenshots/authenticate.png?raw=true "Authenticate")

2. Click on `Authenticate` link it should redirect you to login page of Mercedes Me.
![MMM-MercedesMe Screenshot](screenshots/login.png?raw=true "MM Login")

3. It will also show you consent screen for electice or vehicle status based on your vehicle type
![MMM-MercedesMe Screenshot](screenshots/consent.png?raw=true "Consent screen")

4. Once you click `Allow` it should redirect back to Magic Mirror and should show you Mercedes Me data based on your display style.

![MMM-MercedesMe Screenshot](screenshots/twodial.gif?raw=true "Title 2")


## Dependencies
- [request](https://www.npmjs.com/package/request) (available via `MM core`)
- [fs](https://nodejs.org/api/fs.html) (available via `node.js`)

## Updating
To update the module to the latest version, use your terminal to go to your MMM-ModuleScheduler module folder and type the following command:

````
git pull
```` 

## Troubleshooting
If something is not working, turn on logging by setting the config variable `debug` to true, and look at the data you receive in dev tools and console of MM.

## Bug reports
If you find a bug or have an improvement suggestions, please create a Github issue.

## Contributions
Contributions are welcome. Please create a github issue first, so we can dicuss the change before you make it. Create a pull request when you have a change to submit.

## Thanks
- Thanks to [Michael Teeuw](https://github.com/MichMich) and [community](https://forum.magicmirror.builders/) for creatig Magic Mirror<sup>2</sup> 
- Thanks to [Jerry P](https://forum.magicmirror.builders/user/jerryp) for testing this module on live car data

The MIT License (MIT)
=====================

Copyright © 2021 Ashish Tank

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
