# Design Document
Keep in mind that the documentation is not complete and is likely to be outdated, as this was parts of this documentation were written before the actual implementation. For more information, please refer to the source code and the comments in the code.

## Login-Based system
Users should be able to register in order to avoid seeing messages of other users. Authentication will be done by using a unique name and a password. The password will be hashed and salted before being stored in the database. The user will be able to change their password when logged in.

## Bi-Directional Communication
The transmission of messages between clients and the server will be performed using Websockets, in order to avoid polling-based message retrieval.

## Database Plan
Persistent data such as login information (username, hashed password), profile picture, chat history and existing groups are stored in a SQLite database.

### Table Structure
The database is planned with the following tables, with more to be added if necessary:
* `User`:
  * `username` (TEXT, UNIQUE)
  * `visibleName` (TEXT)
  * `email` (TEXT)
  * `password` (TEXT)
  * `profilePic` (TEXT)
* `Chats`:
  * `username_a` (TEXT)
  * `username_b` (TEXT)
* `Messages`:
  * `message_id` (INTEGER, PRIMARY KEY)
  * `message` (TEXT)
* `Chat_Messages`:
  * `username_a` (TEXT)
  * `username_b` (TEXT)
  * `message_id` (INTEGER)
* `Files`:
  * `file_id` (INTEGER, PRIMARY KEY)
  * `filename` (TEXT)
  * `file` (BLOB)
* `File_Messages`:
  * `message_id` (INTEGER)
  * `file_id` (INTEGER)

### Database Methods
* `findMessagesByCreator` - Returns all messages created by a user
* `findMessagesDuringTime` - Returns all messages created during a certain time period

## API Plan
These are the API endpoints currently planned. More may be added if we see a need for them.  
Endpoints marked with a **\*** expect a JWT token in the `Authorization` header.

### Authentication
* `POST` - `/auth/register` - 
  * provide username, email and password in body
* `POST` - `/auth/login`
  * provide username and password in body
  * returns a JWT token

### Profile Management
* `PUT` - `/profile/picture`\*
  * provide picture (base64) in body and set for the authenticated user
* `GET` - `/profile/picture?username=<username>`
  * provide username as URL parameter
  * return the profile picture of the user
* `DELETE` - `/profile/picture`\* 
  * delete the profile picture of the authenticated user
* `PUT` - `/profile/visibleName`\*
  * provide visibleName in body and set for the authenticated user
* `GET` - `/profile/visibleName?username=<username>`
  * provide the username as URL parameter
  * return the visible name

### Messaging
* `GET` - `/messages/:chatId/retrieveMessages?amount=<amount>`\*
  * provide the chatId as URL parameter and optionally the amount of messages to retrieve
  * return the latest amount messages of the chat
* `GET` - `/messages/subscribe?channelName=<name>`\*
  * provide the channelName as URL parameter
  * sub scribe to a channel used with bi-directional communication
* `POST` - `/messages/:chatId/sendMessage`\*
  * provide the chatId as URL parameter and the message in the body
  * send a message to the chat
* `DELETE` - `/messages/:messageId`\*
  * provide the messageId as URL parameter
  * delete a message
* `POST` - `/messages/:chatId/sendFile`\*
  * provide the chatId as URL parameter and the file in the body
  * send a file to the chat
  * return the fileId
* `GET` - `/files/:fileId`\*
  * provide the fileId as URL parameter
  * return the file
* `DELETE` - `/files/:fileId`\*
  * provide the fileId as URL parameter
  * delete the file by clearing the blob field
