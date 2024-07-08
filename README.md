# FitFinder

## About 

SHSHacks 2021 submission. A web application for matching with fitness partners in your area. 

## Built With

* Node.js
* EJS

## Running with Docker

### Prerequisites 

* Docker

### Building and Running Container

1. Build the container
    ```bash
    docker build --tag fitfinder .
    ```
2. Create a copy of `template.env` and name it `.env`
3. Update `.env` configuration
4. Start the container
    ```
    docker run -v ./data:/app/data -v ./data/imgs:/app/assets/global/imgs -p 8080:8080 -p 8000:8000 fitfinder
    ```
    Change `8080:8080` (or `8000`) to `8080:<YOUR DESIRED PORT>` if you'd like to change the port the application listens on
5. Access the application at `localhost:8080` and websocket is open on port 8000
  
## Developing Locally

### Prerequisites

* Node.js (Tested with Node 18)

### Starting the Application

1. Install dependencies
    ```bash
    npm install
    ```
2. Create a copy of `template.env` and name it `.env`
3. Update `.env` configuration
4. Start server
    ```bash
    node server.js
    ```
