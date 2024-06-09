# Fullstack Web Chat
Fullstack Web Chat project for the LVA "Introduction to Fullstack Web Development"

## Description
This project is the implementation of a simple web-based chat application. The application uses a client-server architecture and is implemented using the following technologies:
- **Frontend**: Vue.js, HTML, CSS, TypeScript, Websockets
- **Backend**: Node.js, Express.js, Websockets
* **Database**: SQLite

## Features
- **User Authentication**: Users can register and login to the chat application. The user's password is salted and hashed before being stored in the database.
- **Chat**: Users can send messages to other users in real-time. The chat supports text messages and file attachments (up to 10MB)
- **User Profile**: Users can view their profile and update their profile picture, visible and password.

## Running the project locally
1. Clone the repository
2. Install the dependencies for the front- and backend.  
(We recommend using `pnpm` but `npm` likely works as well)
```bash
cd frontend
pnpm install
cd ../backend
pnpm install
```
3. Start the backend server
```bash
cd backend
pnpm start
```
4. Start the frontend server
```bash
cd frontend
pnpm dev
```
or
```bash
cd frontend
pnpm build
pnpm preview
```
5. Open your browser and navigate to `http://localhost:3000` (for `pnpm dev`) or `http://localhost:4173` (for `pnpm preview`)
6. You can now register a new user and start chatting!

## Database & API Documentation
The documentation can be found in the [Design_Docs.md](Design_Docs.md) file.

## Authors
- Bernhard Schertler (*k12006715*) - [GitHub](https://github.com/Bernhard2000)
- Alexander Voglsperger (*k12005568*) - [GitHub](https://github.com/MrMinemeet)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.