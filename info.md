- concurrently & nodemon: dev dependencies for running front and back end the same time, nodemon for watching for server changes

- bcryptjs: encrypting pswd

- config: for db strings

- gravatar: for providing avatar profile

- jsonwebtoken: for generating token for auth

- request: for making request to github profiles

scripts to run the server

## in backend

"start": "node server",
"server": "nodemon server"

## in client

we will create scripts to run react, and a dev script to run both back and front concurrently

## db

elysiumdb

## mongo as a service

net start MongoDB

## errors: check id in user modal

express-validator: requires to express-validator/check are deprecated.You should just use require("express-validator") instead.

profile exist, let's update!
Cast to ObjectId failed for value "{ user: '5f6b57be5e6f9d269c4c95b6' }" at path "\_id" for model "profile"
