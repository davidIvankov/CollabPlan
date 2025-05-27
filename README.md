# CollabPlan

CollabPlan is a collaborative project planning application designed for remote teams. It provides features such as authentication, project creation, participant management, task assignment, AI-powered task duration suggestions, notifications, and calendar integration for task visualization. The app is ideal for remote teams looking to streamline their project planning and collaboration.

## Hosted Application

The application is hosted at:
[CollabPlan](https://collabplan.f9zj85wh85y6m.eu-central-1.cs.amazonlightsail.com/)

## Features

- **Authentication**: Secure login and registration for users.
- **Project Management**: Create and manage projects.
- **Participant Management**: Add participants to projects and assign roles.
- **Task Management**: Create tasks, assign them to participants, and track their progress.
- **AI Task Duration Suggestion**: Get smart suggestions for how long a task might take, powered by AI.
- **Notifications**: Receive notifications for invitations, project updates, and task assignments.
- **Calendar Integration**: Visualize tasks in a calendar for better planning and scheduling.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database (or use an existing one).
4. Set up `.env` files in `client` and `server` based on the provided `.env.example` files.

## Tests

```bash
# front end unit and E2E tests
npm test -w client

# front end unit tests
npm run test:unit -w client

# front end E2E tests
npm run test:e2e -w client

# back end tests with an in-memory database
npm test -w server
```

## Running the Project in Development

```bash
# automatically restarts the server
npm run dev -w server

# client can be started separately
npm run dev -w client
```

## Running the Project in Production

### Client (when not using a dedicated server application):

```bash
npm run build -w client
npm run preview -w client
```

### Server:

```bash
npm run build -w server
npm run start -w server
```

## License

This project is licensed under the MIT License.
