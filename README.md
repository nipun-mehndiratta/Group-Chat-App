# Group-Chat-App
This is a real-time group chat application built using Node.js, Socket.io,React and MongoDB.

Features
Users can register and login to the chat app.
Authenticated users can send and receive real-time messages in the chat.
Messages are displayed with the username of the sender.
Previous chat history is fetched from the MongoDB database and displayed when a user logs in.
Getting Started
To run this project on your local machine, follow the instructions below:

Prerequisites
Node.js installed on your machine
MongoDB Atlas account or local MongoDB server
Installation
Clone the repository to your local machine.
bash
Copy code
git clone https://github.com/nipun-mehndiratta/group-chat-app.git
cd group-chat-app
Install the dependencies for both the frontend and backend.
bash
Copy code
cd frontend
npm install

cd ../backend
npm install
Database Configuration
Replace username, password, and cluster-url with your actual MongoDB Atlas credentials.

Create a .env file for secret key used for authentication:
For ex: SECRET_KEY=secre8

Running the Application
Start the backend server. In the backend directory, run:
bash
Copy code
npm start
The backend server will run on http://localhost:3001.

Start the frontend application. In the frontend directory, run:
bash
Copy code
npm start
The frontend development server will run on http://localhost:3000.

Open your web browser and visit http://localhost:3000 to access the Group Chat App.

Contributing
If you'd like to contribute to this project, please follow the standard GitHub flow: Fork the repository, create a new branch, make changes, and submit a pull request.
