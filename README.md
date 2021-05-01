# URL Shortener

An API to shorten your URL's. Built for FreeCodeCamp's APIs and Microservices certification [(completed in April 2021)](https://www.freecodecamp.org/certification/cvega21/apis-and-microservices).

<img src="https://user-images.githubusercontent.com/54726618/116796466-3aa13780-aaa2-11eb-91aa-2849539ea24f.gif" width="700" height="500">

## API Endpoints
1. `POST /api/shorturl/new`
    - Expected request body: `{url: https://www.example.com}` 
    - Expected response: `{"original_url": "https://www.example.com","short_url": 22}`
2. `GET /api/shorturl/{short_url}`
    - Expected response: redirected to the corresponding website (e.g. will return the target website's HTML)

## Tech Stack / Architecture
The app is built on a **Node.JS**/**Express** back-end, and a **MongoDB** Atlas database hosted on the cloud. Additionally, I used the following libraries:
- dns.promises
- Mongoose


## What I Learned

- Connecting to MongoDB and persisting data
- Parsing request body using express middleware
- Bypassing default ISP DNS servers with Google's DNS servers
- Parsing URL objects in javascript
- Working with Heroku environment variables
