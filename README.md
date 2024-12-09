# Demo of Current Features

## Login & Registration

![Alt Text]()

## App Walkthrough

[Alt](https://www.youtube.com/watch?v=YisTqdfJdy0)

# Getting Started with Meet Me Halfway

This guide will help you set up the Meet Me Halfway environment for both frontend and backend development.

## Initial Dev Env Setup

Verify installation for the following:
Node.js


    In the root directory of the project "mmh" run this command to install the frontend dependencies

        npm install

    Then change directories into the backend directory

        cd backend

    Now run this command to install the backend dependencies

        composer install

## Frontend Setup

To get the frontend environment up and running, execute the following command (in the mmh directory):

    npx expo start

**Note:** For mobile development, ensure you're running on the same IP as your network, not `127.0.0.1`.

## Backend Setup

Using Parse/Back4App

### Running on a Network IP ( REQUIRED FOR MOBILE DEV USING QR CODE )

If you need to serve your backend on your network IP for devices on the same network to access it, use:

    php artisan serve --host=YOUR_NETWORK_IP --port=8000

Replace `YOUR_NETWORK_IP` with your actual network IP address.

## Collaborating

### Clone

First make sure you clone the project with:

    git init
    git clone https://github.com/codeBender31/Meet-Me-Halfway-Two

Then go in the cloned repos directory:

    cd MeetMeHalfway

### Create Branch

Create Your Own Workspace (Branch)

Command:
git pull

    git checkout -b <your branch name>

    git branch <your branch name>

This creates a new branch named <your branch name>.

Command:
git checkout <your branch name>

This switches you to your new branch so you can start working.

You can then work on the project. Once you are ready to save your work you fetch and merge then push to the main branch:

    git fetch origin
    git add <the path to the file files you have worked on>
    git commit -m "Describe your changes here"
    git push origin my-branch

    * if its your first time and just set up your branch run this command to set the upstream *

    git push --set-upstream origin <your branch name>

Ensure that all team members are on the same page by regularly pulling changes from the remote repository ( do this often just when you remember to stay current you dont know when someone pushed last):

    git checkout <your branch name>
    git pull origin main

### Pull Request.

    Now, you’ll ask the team to look at your changes by opening a pull request on GitHub. This is where you can discuss and review the changes.

    Go to the GitHub repository online and you’ll likely see a prompt to create a pull request for your branch. Follow the online instructions—it’s pretty straightforward.

## Starting Environment Previous Issues

## SEEDING THE DATABASE

to seed the database run this command (in the backend folder):

    php artisan db:seed

**\*ERROR**
ERROR:
TypeError: \_RNGestureHandlerModule.default.flushOperations is not a function (it is undefined), js engine: hermes

Solution: run these commands

    npm uninstall react-native-gesture-handler
    npm install react-native-gesture-handler

ERROR:
If any errors arise from outdated dependencies

SOLUTION:
Run:
“Npm outdated” to see dependencies that need updating

    Then run:

        npm install dependency-name@Latest_version

