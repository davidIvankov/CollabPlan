# Server

This folder contains the backend server code for the project. The server is responsible for handling API requests, interacting with the database, and performing business logic.

## Folder Structure

- `src/`
  - `controllers/`: Contains the controller files that handle incoming HTTP requests and return responses.
  - `entities/`: Contains the TypeScript types and interfaces that define the shape of the data used in the application.
  - `middlewares/`: Contains middleware functions that process requests before they reach the controllers.
  - `repositories/`: Contains the repository files that handle database operations.
  - `utils/`: Contains utility functions and helpers used throughout the server code.
  - `index.ts`: The entry point of the server application.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher) or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject/server
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

### Configuration

Create a `.env` file in the `server` folder and add the necessary environment variables. For example:

```env
DATABASE_URL=your_database_url
PORT=3000
```

### Running the Server

To start the server in development mode, run:

```bash
npm run dev
```

or

```bash
yarn dev
```

The server will start on the port specified in the `.env` file (default is 3000).

### Building for Production

To build the server for production, run:

```bash
npm run build
```

or

```bash
yarn build
```

The compiled files will be placed in the `dist` folder.

### Running in Production

To start the server in production mode, run:

```bash
npm start
```

or

```bash
yarn start
```

## Database Migrations

The server uses Kysely for database migrations. Migration files are located in the `src/database/migrations` folder.

### Running Migrations

To run the migrations, use the following command:

```bash
npm run migrate
```

or

```bash
yarn migrate
```

## Database Schema

You can view the database schema diagram [here](https://dbdiagram.io/d/Project-menagment-67113c6b97a66db9a35cc211).

## API Endpoints

### Project

#### Create a Project

- **Procedure**: `project.create`
- **Input**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Output**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdBy": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.
  `

#### Delete a Project

- **Procedure**: `project.deleteProject`
- **Input**:

  ```json
  "id"


  // UUID of the project to be deleted
  ```

- **Output**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdBy": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.
  `

#### Get Projects by Creator

- **Procedure**: `project.getByCreatedBy`
- **Input**:

  ```json
  "id"
  ```

- **Output**:

```
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdBy": "string"
  }
]
```

#### Get Project by ID

- **Procedure**: `project.getById`
- **Input**:

  ```json
  "id"


  // UUID of the project to be retrieved
  ```

- **Output**:

```
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdBy": "string"
}
```

#### Update a Project

- **Procedure**: `project.update`
- **Input**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Output**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Delete a Project

- **Procedure**: `project.delete`
- **Input**:

  ```json
  "projectId"
  ```

- **Output**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

### Project Participants

#### Create a Project Participant

- **Procedure**: `projectParticipant.create`
- **Input**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string" // optional
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string",
    "availability": { "start": "string", "end": "string" }[]
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Get a Project Participant

- **Procedure**: `projectParticipant.get`
- **Input**:
  ```json
  {
    "userId": "string",
    "projectId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string",
    "availability": { "start": "string", "end": "string" }[]
  }
  ```

#### Remove a Project Participant

- **Procedure**: `projectParticipant.remove`
- **Input**:
  ```json
  {
    "userId": "string",
    "projectId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string",
    "availability": { "start": "string", "end": "string" }[]
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Change Role of a Project Participant

- **Procedure**: `projectParticipant.changeRole`
- **Input**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string"
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string",
    "availability": { "start": "string", "end": "string" }[]
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Set Availability of a Project Participant

- **Procedure**: `projectParticipant.setAvailability`
- **Input**:
  ```json
  {
    "projectId": "string",
    "availability": { "start": "string", "end": "string" }[]
  }
  ```
- **Output**:
  ```json
  {
    "availability": "array"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### remove Availability of a Project Participant

- **Procedure**: `projectParticipant.removeAvailability`
- **Input**:
  ```json
  {
    "projectId": "string",
    "scheduledTime": { "start": "string", "end": "string" }
  }
  ```
- **Output**:
  ```json
  {
    "availability": "array"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

### Task

#### Create a Task

- **Procedure**: `task.create`
- **Input**:
  ```json
  {
    "projectId": "string",
    "name": "string",
    "description": "string", //optional
    "duration": "number" //in minutes
  }
  ```
- **Output**:
  ```json
  {
    "createdAt": "string",
    "duration": "number",
    "scheduledTime": { "start": "string", "end": "string" },
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assignedTo": "string",
    "status": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### assign a Task

- **Procedure**: `task.assign`
- **Input**:
  ```json
  {
    "id": "string",
    "scheduledTime": { "start": "string", "end": "string" }
  }
  ```
- **Output**:
  ```json
  {
    "createdAt": "string",
    "duration": "number",
    "scheduledTime": { "start": "string", "end": "string" },
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assignedTo": "string",
    "status": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### set task ready for the review

- **Procedure**: `task.setReview`
- **Input**:
  ```json
  "taskId"
  ```
- **Output**:
  ```json
  {
    "id": "string",
    "status": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### review a Task

- **Procedure**: `task.setReview`
- **Input**:
  ```json
  {
    "id": "string",
    "name": "string", //optional
    "description": "string", //optional
    "status": "string"
  }
  ```
- **Output**:
  ```json
  {
    "createdAt": "string",
    "duration": "number",
    "scheduledTime": { "start": "string", "end": "string" },
    "id": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assignedTo": "string",
    "status": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

### User

#### Login

- **Procedure**: `user.login`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Output**:
  ```json
  {
    "accessToken": "string"
  }
  ```

#### Search

- **Procedure**: `user.search`
- **Input**:
  ```json
  "string"
  ```
- **Output**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  ]
  ```

#### Signup

- **Procedure**: `user.signup`
- **Input**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Output**:
  ```json
  {
    "id": "string"
  }
  ```

## Testing

To run the tests, use the following command:

```bash
npm test
```

or

```bash
yarn test
```
