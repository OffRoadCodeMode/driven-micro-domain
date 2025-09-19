// Load environment variables from .env file (for local testing)
import dotenv from 'dotenv';
dotenv.config();

import { createLambdaHandler } from 'driven-micro';
import bootstrapFunction from '../../bootstrap';
import { Request } from '../models/Request';
import { CreateCommand } from '../service/messages/commands/CreateCommand';

// Initialize the framework
const messageBus = bootstrapFunction();

// Create the Lambda handler
export const handler = createLambdaHandler({
    messageBus,
    requestConstructor: Request,
    createCommand: (request: Request) => new CreateCommand(request),
});
