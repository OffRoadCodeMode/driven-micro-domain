// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createApiEntryPoint, startApiServer } from 'driven-micro';
import bootstrapFunction from '../../bootstrap';
import { Request } from '../models/Request';
import { CreateCommand } from '../service/messages/commands/CreateCommand';

// Initialize the framework
const messageBus = bootstrapFunction();

// Create the API entry point
const app = createApiEntryPoint({
    messageBus,
    requestConstructor: Request,
    createCommand: (request: Request) => new CreateCommand(request),
    basePath: '/run'
});

// Start the server for local development
const port = Number(process.env.API_PORT || process.env.PORT || 4011);
startApiServer(app, port);

export default app;
