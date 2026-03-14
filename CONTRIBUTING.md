# Contributing Guide

## Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes and test locally
   ```bash
   npm run dev
   ```

3. Commit with clear messages
   ```bash
   git commit -m "feat: add new feature description"
   ```

4. Push to branch
   ```bash
   git push origin feature/my-feature
   ```

5. Create Pull Request with description

## Code Standards

### TypeScript
- Use strict mode
- Define types for all functions
- Avoid `any` type

### Components
- Functional components only
- Use hooks for state
- Split large components

### Database
- Use proper parameterized queries
- Always check RLS policies
- Add indexes for frequently filtered columns

### Security
- Never commit secrets
- Validate all inputs
- Use environment variables

## Testing

```bash
# Unit tests (when added)
npm run test

# Build check
npm run build

# Lint
npm run lint
```

## Performance

- Minimize bundle size
- Use dynamic imports for large features
- Cache database queries
- Optimize database indexes

## Documentation

- Update README for major changes
- Add comments for complex logic
- Keep DEPLOYMENT.md updated
- Document API changes

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to main
5. Deploy to production
