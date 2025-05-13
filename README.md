# sports-social-bff-api
This is a BFF API for [Sports social front end App](https://github.com/aterna01/sports-social-frontend)

It is built using [express](https://expressjs.com/) and [nodejs](https://nodejs.org/en)

## Install all dependencies:
```
npm i
```

## Export next environmnet variables:
```
JWT_SECRET="some_secret"
DB_NAME="sportsSocialDB"
MONGO_DB_CONN_STRING="some_mongo_connection_string"
FRONTEND_URL="http://localhost:3000" // assumming that Sports social front end App will also run on your local machine pointing to port 3000
```



## Start the BFF API on your local machine
```
npm start
```

Now the API should be running on ```http://localhost:5000/```
There is nodemon running in front of the application, so after every change in the source code the nodemon will automatically restart the server.

*Other option to run API is to create an image from existing Docker file and spin up a docker container*

## Running tests
There are unit and integration tests. For integration tests we need mongoDB to be available. There is a docker compose file which spins up a mongoDB container, just run ```docker compose up -d```, now the MongoDB should be available on ```http://localhost:27017/```

Once the MongoDB is up, you can run next command to run all tests:
```npm test```

