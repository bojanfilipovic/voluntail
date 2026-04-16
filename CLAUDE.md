# Global Context

Read and follow all documentation and instructions from the Superbet context repository. The repository is located at `$BETLER_WORKSPACE/player.claude.context/`.

At the start of each session, read `$BETLER_WORKSPACE/player.claude.context/CLAUDE.md` for the full documentation index, coding guidelines, and architectural context. Reference the docs in `$BETLER_WORKSPACE/player.claude.context/.claude/docs/` as needed.


# Git Workflow Standards

## Branch Strategy
- Feature branches: `<initials>-<description>` (no slashes - breaks CI)
- Never push directly to main/master
- All changes via PR with CI gates

## Pre-Commit Requirements (Erlang Services)
Automated via pre-commit hook:
1. make format
2. make tests
3. make dialyze
4. make elvis

## Commit Approval Process
Before commit:
- Show: service, repo, branch, change summary
- Offer full diff on request
- Explicit approval required

Before push:
- Show: commits being pushed
- Explicit approval required

## Prohibited Operations
- Direct push to main/master (no exceptions)
- Force push to protected branches
- Amending published commits on shared branches

**Emergency Override**: Contact tech lead for critical hotfixes.
