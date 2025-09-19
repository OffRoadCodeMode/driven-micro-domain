# Test Suite Documentation

This test suite provides comprehensive coverage for the driven_micro domain application following Detroit-style testing principles with focus on outcomes over behavior.

## Test Structure

```
tests/
├── setup.ts                    # Test configuration and setup
├── unit/                       # Unit tests (fast, isolated)
│   ├── models/                 # Domain models tests
│   │   ├── Domain.test.ts      # Domain aggregate tests
│   │   └── Request.test.ts     # Request model tests
│   ├── messages/               # Commands and events tests
│   │   ├── commands/           # Command tests
│   │   │   ├── CreateCommand.test.ts
│   │   │   ├── ActCommand.test.ts
│   │   │   └── StoreCommand.test.ts
│   │   └── events/             # Event tests
│   │       ├── DomainCreated.test.ts
│   │       ├── DomainActed.test.ts
│   │       ├── DomainStored.test.ts
│   │       └── DomainFailed.test.ts
│   └── handlers/               # Handler tests (mocked dependencies)
│       ├── commands/           # Command handler tests
│       │   ├── CreateCommandHandler.test.ts
│       │   ├── ActCommandHandler.test.ts
│       │   └── StoreCommandHandler.test.ts
│       └── events/             # Event handler tests
│           ├── DomainCreatedHandler.test.ts
│           ├── DomainActedHandler.test.ts
│           └── DomainStoredHandler.test.ts
├── integration/                # Integration tests (real dependencies)
│   ├── adapters/               # Repository integration tests
│   │   └── DynamoDBDomainRepository.test.ts
│   └── service/                # Service layer integration tests
│       └── DynamoDBUnitOfWork.test.ts
└── e2e/                        # End-to-end tests (full workflow)
    └── api.test.ts             # Complete API workflow tests
```

## Running Tests

### Prerequisites

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **LocalStack Setup** (for integration and e2e tests):
   ```bash
   # Start LocalStack (requires Docker)
   docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
   ```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only unit tests (fast)
npm test -- --testPathPattern=unit

# Run only integration tests
npm run test:integration

# Run only e2e tests
npm run test:e2e
```

## Test Categories

### Unit Tests
- **Fast execution** (< 1s per test file)
- **Isolated dependencies** (mocked external services)
- **Focus on core logic** (business rules, data transformations)
- **Detroit-style** (test outcomes, not implementation details)

**Coverage:**
- ✅ Domain models (Domain, Request)
- ✅ Commands and Events (CreateCommand, DomainCreated, etc.)
- ✅ Handler logic (CreateCommandHandler, DomainCreatedHandler, etc.)

### Integration Tests
- **Real database connections** (LocalStack DynamoDB)
- **Test adapter implementations** (DynamoDBDomainRepository)
- **Verify data persistence** (CRUD operations)
- **Transaction management** (Unit of Work pattern)

**Coverage:**
- ✅ DynamoDB repository operations
- ✅ Unit of Work transaction management
- ✅ Database session management
- ✅ Error handling with real dependencies

### E2E Tests
- **Complete workflow testing** (API → Database)
- **Real HTTP requests** (Supertest)
- **Full command/event chain** (Create → Act → Store)
- **Production-like environment** (LocalStack)

**Coverage:**
- ✅ API endpoint validation
- ✅ Request/response handling
- ✅ Complete workflow execution
- ✅ Data persistence verification
- ✅ Error scenarios and edge cases

## Test Principles Applied

### 1. Detroit-Style Testing
- Tests focus on **outcomes** rather than implementation details
- Minimal mocking (only external dependencies)
- Real object interactions within the system under test

### 2. Meaningful Test Coverage
- **No trivial tests** (e.g., testing getters/setters)
- **Core functionality first** (business logic, data flow)
- **Edge cases and error scenarios** included

### 3. Test Organization
- **Clear separation** of unit/integration/e2e concerns
- **Descriptive test names** explaining the scenario
- **Focused assertions** on business outcomes

## Environment Variables

Tests require these environment variables:

```bash
# Test Environment
NODE_ENV=test
AWS_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566  # LocalStack

# DynamoDB Configuration
DOMAIN_TABLE_NAME=test-domain-table
```

## Continuous Integration

The test suite is designed for CI/CD environments:

1. **Unit tests** run in any environment (no external dependencies)
2. **Integration tests** require LocalStack or real AWS resources
3. **E2E tests** require full environment setup

### CI Configuration Example:
```yaml
# GitHub Actions example
- name: Start LocalStack
  run: docker run -d --name localstack -p 4566:4566 localstack/localstack

- name: Run Tests
  run: |
    npm run test              # Unit tests
    npm run test:integration  # Integration tests
    npm run test:e2e         # E2E tests

- name: Generate Coverage
  run: npm run test:coverage
```

## Test Data Management

- **Isolated test data** (unique identifiers per test)
- **Automatic cleanup** (afterEach/afterAll hooks)
- **No test interdependencies** (each test is independent)

## Performance Considerations

- **Unit tests**: < 5 seconds total
- **Integration tests**: < 30 seconds (includes LocalStack setup)
- **E2E tests**: < 60 seconds (includes full workflow)

## Debugging Tests

```bash
# Run specific test file
npm test -- Domain.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Framework Integration

This test suite validates the driven_micro framework integration:

- ✅ **Message Bus** workflow execution
- ✅ **CQRS pattern** (Command/Query separation)
- ✅ **Event Sourcing** (event-driven workflow)
- ✅ **DDD boundaries** (domain model integrity)
- ✅ **Dependency Injection** (Inversify container)
- ✅ **Repository Pattern** (data access abstraction)
- ✅ **Unit of Work** (transaction management)

The tests ensure that all architectural patterns from the extraction_agent are properly implemented and functioning in the domain starter kit.
