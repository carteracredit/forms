# Pre-Completion Checklist

## Mandatory Pre-Completion Checklist

**CRITICAL**: Before marking any task as complete, you MUST:

### 1. Run All Quality Checks

- ✅ Run `pnpm run lint` - ensure all linting checks pass (green)
- ✅ Run `pnpm run format:check` - ensure all formatting checks pass (green)
- ✅ Run `pnpm run typecheck` - ensure all type checks pass (green)
- ✅ Run `pnpm run test` - ensure all tests pass (green)

### 1.1 Accessibility Quality Gate (Axe)

- ✅ For any new/changed UI component or view, add/update an Axe test in Vitest (e.g. `axe(container)` and assert `violations` is `[]`)
- ✅ Treat accessibility tests as first-class unit tests: they MUST be kept up-to-date and MUST be green in CI

### 2. Update Storybook Stories

- ✅ Create/update Storybook stories for any new or modified components
- ✅ Ensure all components have corresponding stories in `src/stories/`
- ✅ Verify stories demonstrate all component variants, states, and use cases
- ✅ Run `pnpm run build-storybook` to ensure stories build without errors
- ✅ Test Storybook locally with `pnpm run storybook` to verify visual rendering

### 3. Test Storybook Wellbeing

- ✅ Verify Storybook builds successfully (`pnpm run build-storybook`)
- ✅ Ensure all stories render correctly without errors
- ✅ Check that component interactions work as expected in Storybook
- ✅ Verify accessibility features are demonstrated in stories
- ✅ Ensure stories are up-to-date with component changes

### 4. Commit Standards (Background Agents Only)

- ✅ Use conventional commits format (see commitlint.config.cjs)
- ✅ Commit message must follow commitlint config (max 200 characters)
- ✅ Include Linear issue reference in commit message if available in cloud agent context
- ✅ Format: `type(scope): description [Linear: ISSUE-ID]` or `type(scope): description (fixes ISSUE-ID)`

## Workflow Summary

When completing any task:

1. ✅ Implement/update code
2. ✅ Create/update Storybook stories for affected components
3. ✅ Run `pnpm run lint` and fix any issues
4. ✅ Run `pnpm run format:check` and fix formatting if needed
5. ✅ Run `pnpm run typecheck` and fix any type errors
6. ✅ Run `pnpm run test` and ensure all tests pass
7. ✅ Run `pnpm run build-storybook` to verify stories build correctly
8. ✅ Test Storybook locally to verify visual rendering and interactions
9. ✅ (Background agents only) Create conventional commit with Linear reference if available

**DO NOT mark work as complete until ALL checks are green and Storybook stories are updated and verified.**
