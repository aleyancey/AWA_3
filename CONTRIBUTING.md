# Contributing to Sound Sanctuary

## Commit Message Guidelines

### Format
```
<type>: <short summary>

<detailed description of changes>

<why these changes were made/impact>
```

### Type
Must be one of the following:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

### Examples

Good commit message:
```
fix: Improve suggestion text positioning in input field

- Adjusted vertical positioning to align with input text
- Fine-tuned padding (0.5rem → 0.4rem) and top values (0.35rem → 0.2rem)
- Ensured consistent baseline alignment with typed text

These changes improve UX by making suggestions appear naturally 
integrated with the input field, matching exactly where text will 
appear when clicked.
```

### Changelog Updates
- Update changelog.md with every significant change
- Place changes under the appropriate section ([Unreleased], or new version)
- Include detailed bullet points explaining what and why
- Link related issue/PR numbers when applicable

### Branch Naming
Format: `<type>/<description>`
Examples:
- `feature/user-authentication`
- `fix/input-alignment`
- `experimental/smooth-animations`

### Development Workflow
1. Create feature branch from main
2. Make commits following commit message guidelines
3. Update changelog.md
4. Push changes
5. Create PR with detailed description

### Pull Request Template
```markdown
## Description
[Describe the changes and their purpose]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [Describe how changes were tested]
- [List any new tests added]

## Changelog
- [List changes as they appear in changelog.md]

## Screenshots (if applicable)
[Add screenshots showing changes]
```

### Code Style
- Use consistent indentation (2 spaces for JavaScript/React)
- Add descriptive comments for complex logic
- Follow React best practices and hooks guidelines
- Keep components focused and single-responsibility 