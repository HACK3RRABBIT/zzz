# Deployment Instructions for Movie Playlist Website

This guide will walk you through the steps to deploy and run the Movie Playlist web application on an Ubuntu server.

## 1. Prerequisites

Before you begin, you will need the following installed on your Ubuntu server:
- **Node.js**: A JavaScript runtime environment.
- **npm**: The Node.js package manager, which comes with Node.js.

You can install these using the following commands:
```bash
sudo apt update
sudo apt install nodejs npm -y
```

## 2. Clone the Repository

First, clone the project repository from GitHub to your server.
```bash
git clone <your-repository-url>
cd <your-repository-directory>
```
Replace `<your-repository-url>` and `<your-repository-directory>` with the actual URL and the folder name of your project.

## 3. Install Dependencies

Navigate into the project's root directory and use `npm` to install all the required packages listed in `package.json`.
```bash
npm install
```

## 4. Configure Admin Credentials (Important!)

For security, you should change the default admin credentials.
1. Open the `server.js` file in a text editor.
2. Find the `ADMIN_USER` object near the top of the file.
3. Change the `username` and `password` to something secure.
   ```javascript
   const ADMIN_USER = {
       username: 'your_new_admin_username',
       password: 'your_strong_password'
   };
   ```
4. Find the `JWT_SECRET` constant and change it to a long, random string.
   ```javascript
   const JWT_SECRET = 'your_super_long_and_secret_string_here';
   ```
5. Save the `server.js` file.

## 5. Start the Application

You can now start the web server by running:
```bash
node server.js
```
The server will start, and you should see the message: `Server is running on port 3000`. The application is now accessible at `http://<your_server_ip>:3000`.

## 6. (Recommended) Use PM2 for Process Management

Running the server with `node server.js` is fine for testing, but it will stop as soon as you close your terminal session. For a production environment, it is highly recommended to use a process manager like **PM2**. PM2 will keep your application running in the background and automatically restart it if it crashes.

### Install PM2
```bash
sudo npm install pm2 -g
```

### Start the Application with PM2
```bash
pm2 start server.js --name "movie-playlist"
```

### Ensure PM2 Restarts on Server Reboot
```bash
pm2 startup
```
This command will generate another command that you need to copy and run. This sets up PM2 to start automatically when the server boots up.

### Save the PM2 Process List
```bash
pm2 save
```
This saves the currently running processes, so PM2 will restart them after a reboot.

Your application is now running continuously and will restart automatically. You can manage it using commands like `pm2 status`, `pm2 restart movie-playlist`, and `pm2 stop movie-playlist`.