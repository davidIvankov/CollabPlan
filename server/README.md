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
    "projectId": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Get a Project

- **Procedure**: `project.get`
- **Input**:
  ```json
  {
    "projectId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "projectId": "string",
    "name": "string",
    "description": "string"
  }
  ```

#### Update a Project

- **Procedure**: `project.update`
- **Input**:
  ```json
  {
    "projectId": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Output**:
  ```json
  {
    "projectId": "string",
    "name": "string",
    "description": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Delete a Project

- **Procedure**: `project.delete`
- **Input**:
  ```json
  {
    "projectId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "projectId": "string"
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
    "role": "string",
    "availability": "array"
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "role": "string",
    "availability": "array"
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
    "availability": "array"
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
    "availability": "array"
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
    "availability": "array"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Set Availability of a Project Participant

- **Procedure**: `projectParticipant.setAvailability`
- **Input**:
  ```json
  {
    "userId": "string",
    "projectId": "string",
    "availability": "array"
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
    "description": "string",
    "assigneeId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "taskId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assigneeId": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Get a Task

- **Procedure**: `task.get`
- **Input**:
  ```json
  {
    "taskId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "taskId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assigneeId": "string"
  }
  ```

#### Update a Task

- **Procedure**: `task.update`
- **Input**:
  ```json
  {
    "taskId": "string",
    "name": "string",
    "description": "string",
    "assigneeId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "taskId": "string",
    "projectId": "string",
    "name": "string",
    "description": "string",
    "assigneeId": "string"
  }
  ```
- **Authentication**: Uses `authProcedure` to check if the user is authenticated.

#### Delete a Task

- **Procedure**: `task.delete`
- **Input**:
  ```json
  {
    "taskId": "string"
  }
  ```
- **Output**:
  ```json
  {
    "taskId": "string"
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
    "token": "string"
  }
  ```

#### Search

- **Procedure**: `user.search`
- **Input**:
  ```json
  {
    "query": "string"
  }
  ```
- **Output**:
  ```json
  [
    {
      "userId": "string",
      "username": "string"
    }
  ]
  ```

#### Signup

- **Procedure**: `user.signup`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
- **Output**:
  ```json
  {
    "userId": "string",
    "username": "string",
    "email": "string"
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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

```

```
