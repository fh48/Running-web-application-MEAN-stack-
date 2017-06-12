# Runciple

This project includes:

* The backend folder containing the express server application.
* The frontend folder containing the AngularJS application.
* The Mercurial Repository can be found at the following URL https://ks255.hg.cs.st-andrews.ac.uk/CS5003-p3/

## Initialise project
The node_modules folders containing the used node modules are not included in the submission. In order to initialise the project, the node modules for the back-end and the front-end have to be imported. Therefore, it is necessary that [node](https://nodejs.org/en/) is installed on your computer. For initialising the project, the following commands need to be executed.

```bash
$ cd frontend/
$ npm install
$ cd ../backend/
$ npm install
```

## Start Application
The application's functionality is tested on the Google Chrome 57.0.2987.133 (64-bit) browser. In order to start the application, make sure you are in the backend folder of the project. There are two ways how to start the server.

### Method 1
Execute the script provided in the package.json.
```bash
npm start
```

### Method 2
Start the server manually.
```bash
node ./app
```
### Open App
To open the app, type http://localhost:1337/ in Google Chrome.

## Run Tests
Make sure you installed Mocha globally before running the tests.
```bash
npm install --global mocha
```
There are two ways to run the application tests.

### Method 1
Execute the script provided in the package.json.
```bash
npm test
```

### Method 2
Start the server manually.
```bash
mocha ./test/top --timeout 15000
```
## Login
Username: kasim; Password: kasim

other accounts
* Username: James Coxon; Password: jc
* Username: Laura Cook; Password: lc
* Username: Ife Bolt; Password: ib
* Username: tomas; Password: tomas

## GPX file
There are several GPX files for you to test the functionality of the application located in the example-gpx-files folder.

## Problems with the database
If there are any problems with the database, please feel free to contact the team.
