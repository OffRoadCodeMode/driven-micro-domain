// Dependency injection types for the domain layer
export const TYPES = {
    UnitOfWork: Symbol.for('UnitOfWork'),
    DomainRepo: Symbol.for('DomainRepo'),
    LLMClient: Symbol.for('LLMClient'),
    LLMPrompt: Symbol.for('LLMPrompt'),
    LLMResponse: Symbol.for('LLMResponse')
};
