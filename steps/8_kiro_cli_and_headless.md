# Step 8 — Kiro CLI and Headless Mode

> **Goal:** Take Kiro out of the IDE and into the terminal. Show the Kiro CLI for interactive development, then demonstrate headless mode for CI/CD automation.

---

## 8.1 — Kiro Beyond the IDE

Everything we've done so far has been inside the Kiro IDE. But Kiro also lives in the terminal as the **Kiro CLI** — a full-featured agent experience for developers who prefer the command line, work over SSH, or need to automate workflows in CI/CD pipelines.

Same agent. Same models. Same steering, hooks, MCP, and skills. Just a different interface.

---

## 8.2 — Installing the CLI

### macOS / Linux

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

### Windows (PowerShell)

```powershell
irm 'https://cli.kiro.dev/install.ps1' | iex
```

After installation, authenticate:

```bash
kiro-cli login
```

This opens your browser for authentication. You can use the same account (Google, GitHub, Builder ID, or IAM Identity Center) as the IDE.

---

## 8.3 — Interactive Chat

The simplest way to use the CLI:

```bash
cd my-tic-tac-toe-project
kiro-cli
```

This drops you into an interactive chat session with a rich terminal UI — syntax-highlighted code, interactive panels, and visual tool progress.

### Key features in the terminal

**Ask a question directly:**

```bash
kiro-cli chat "Explain the game logic in Board.tsx"
```

**Translate natural language to shell commands:**

```bash
kiro-cli translate "find all TypeScript files modified today"
```

**Run shell commands inline** (prefix with `!`):

```bash
!npm run build
```

**Manage context:**

```bash
/context show              # See what files are in context
/context add "src/**/*.ts" # Add files by glob pattern
/context remove src/app.js # Remove a file
```

**Resume previous sessions:**

```bash
kiro-cli chat --resume           # Resume last session
kiro-cli chat --resume-picker    # Pick from session list
kiro-cli chat --list-sessions    # List all saved sessions
```

### What to demo

Open a terminal, `cd` into the tic-tac-toe project, and run `kiro-cli`. Ask it to do something with the game — explain a component, add a small feature, fix a bug. Show that it has the same capabilities as the IDE chat: it reads files, writes code, runs commands, and follows your steering files.

---

## 8.4 — CLI-Specific Features

### Custom Agents

The CLI supports custom agent configurations — specialized agents for specific workflows:

```bash
kiro-cli agent list                    # List available agents
kiro-cli agent create code-reviewer    # Create a new agent
kiro-cli agent edit code-reviewer      # Edit an agent
kiro-cli agent set-default code-reviewer  # Set as default
```

Then use it:

```bash
kiro-cli chat --agent code-reviewer "Review the latest changes"
```

### MCP Management from the Terminal

```bash
kiro-cli mcp list                      # List configured servers
kiro-cli mcp add --name playwright \
  --command "npx" \
  --scope workspace                    # Add a server
kiro-cli mcp status --name playwright  # Check connection
kiro-cli mcp remove --name playwright  # Remove a server
```

### Inline Suggestions

The CLI can provide ghost-text suggestions as you type commands:

```bash
kiro-cli inline enable    # Turn on inline suggestions
kiro-cli inline status    # Check current status
```

### Diagnostics

```bash
kiro-cli doctor           # Check for common issues
kiro-cli diagnostic       # Full system report
kiro-cli whoami           # Check auth status
```

---

## 8.5 — Headless Mode: Kiro in CI/CD

This is the big one. Headless mode lets you run Kiro CLI **non-interactively** — no terminal UI, no user input. Pass a prompt, get a result. Perfect for CI/CD pipelines.

### How it works

1. **Generate an API key** from your [Kiro account settings](https://app.kiro.dev/)
2. **Set it as an environment variable:**
   ```bash
   export KIRO_API_KEY=your-api-key-here
   ```
3. **Run with `--no-interactive`:**
   ```bash
   kiro-cli chat --no-interactive "your prompt here"
   ```

### Tool trust

Since there's no user to approve tool calls, you grant permissions upfront:

```bash
# Trust all tools
kiro-cli chat --no-interactive --trust-all-tools "Write tests and run them"

# Trust only specific categories (principle of least privilege)
kiro-cli chat --no-interactive --trust-tools=read,grep "Find all TODO comments"
```

### Demo: Automated code review on our game

```bash
export KIRO_API_KEY=$KIRO_API_KEY

# Review the codebase for issues
kiro-cli chat --no-interactive --trust-tools=read,grep \
  "Review the tic-tac-toe codebase for potential bugs, security issues, and performance problems. Report your findings."
```

Kiro reads the code, analyzes it, and prints a report — all without any interactive input.

### Demo: Generate a test report

```bash
kiro-cli chat --no-interactive --trust-all-tools \
  "Run npm run build for the tic-tac-toe project. If it succeeds, report the bundle size. If it fails, explain the errors."
```

### Piping context in

You can pipe data into headless mode for richer context:

```bash
# Review a git diff
git diff | kiro-cli chat --no-interactive "Review these changes for issues"

# Troubleshoot a build failure
cat build-error.log | kiro-cli chat --no-interactive "Explain this build failure and suggest a fix"
```

---

## 8.6 — CI/CD Integration: GitHub Actions Example

Here's a real GitHub Actions workflow that uses Kiro headless mode to review PRs:

```yaml
name: Kiro Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Kiro CLI
        run: curl -fsSL https://cli.kiro.dev/install | bash

      - name: Review PR changes
        env:
          KIRO_API_KEY: ${{ secrets.KIRO_API_KEY }}
        run: |
          kiro-cli chat --no-interactive --trust-tools=read,grep \
            "Review the changes in this PR for security issues, bugs, and code quality problems."
```

### Other CI/CD patterns

| Pattern                   | Command                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Automated code review** | `kiro-cli chat --no-interactive --trust-tools=read,grep "Review this PR"`                                         |
| **Generate tests**        | `kiro-cli chat --no-interactive --trust-all-tools "Write tests for the auth module and run them"`                 |
| **Troubleshoot failures** | `cat build.log \| kiro-cli chat --no-interactive "Explain this failure"`                                          |
| **Documentation check**   | `kiro-cli chat --no-interactive --trust-tools=read "Check if README is up to date with the code"`                 |
| **Security scan**         | `kiro-cli chat --no-interactive --trust-tools=read,grep "Scan for hardcoded secrets or security vulnerabilities"` |

---

## 8.7 — CLI Flags Quick Reference

| Flag                         | What it does                                                    |
| ---------------------------- | --------------------------------------------------------------- |
| `--no-interactive`           | Run without interactive session (requires prompt as argument)   |
| `--trust-all-tools`          | Auto-approve all tool calls                                     |
| `--trust-tools=<categories>` | Auto-approve specific tool categories (read, grep, write, etc.) |
| `--require-mcp-startup`      | Fail if MCP servers can't connect (good for pipelines)          |
| `--resume`                   | Resume the last conversation                                    |
| `--resume-picker`            | Pick a session to resume                                        |
| `--agent <name>`             | Use a specific custom agent                                     |
| `-v` / `-vv` / `-vvv`        | Increase logging verbosity                                      |

---

## 8.8 — What We Just Demonstrated

| Kiro Feature             | How we used it                                       |
| ------------------------ | ---------------------------------------------------- |
| **Kiro CLI**             | Interactive chat in the terminal                     |
| **CLI installation**     | One-line install on macOS/Linux/Windows              |
| **Interactive features** | Chat, translate, inline commands, context management |
| **Custom agents**        | Create and use specialized agent configs             |
| **MCP from CLI**         | Manage MCP servers via command line                  |
| **Session management**   | Resume, list, and manage chat sessions               |
| **Headless mode**        | Non-interactive execution with `--no-interactive`    |
| **API key auth**         | `KIRO_API_KEY` for programmatic access               |
| **Tool trust**           | `--trust-all-tools` and `--trust-tools` for CI/CD    |
| **CI/CD integration**    | GitHub Actions example for automated code review     |
| **Piping context**       | `git diff \| kiro-cli chat` for richer prompts       |

---

## Key Takeaway

The Kiro CLI brings the full agent experience to the terminal. Interactive mode is great for developers who live in the command line. Headless mode is the game-changer — it turns Kiro into a CI/CD tool that can review code, generate tests, troubleshoot failures, and enforce standards automatically on every push.

Same steering files. Same hooks. Same MCP servers. Same skills. Just running without a human in the loop.

---

## Wrapping Up the Workshop

We've now covered the full Kiro platform:

| Step | Feature              | What we did                                                           |
| ---- | -------------------- | --------------------------------------------------------------------- |
| 1    | **IDE + Vibe mode**  | Toured Kiro, scaffolded the game from a picture                       |
| 2    | **Specs**            | Added a backend with structured requirements → design → tasks         |
| 3    | **Skills**           | Installed frontend-design and React best practices skills             |
| 4    | **Steering**         | Taught Kiro our project conventions                                   |
| 5    | **Hooks**            | Automated build checks, accessibility reviews, post-task verification |
| 6    | **Powers**           | Extended Kiro with external service integrations                      |
| 7    | **MCP + Playwright** | Configured raw MCP, tested the game in a real browser                 |
| 8    | **CLI + Headless**   | Took Kiro to the terminal and CI/CD pipelines                         |

From a picture of a tic-tac-toe board to a full-stack, tested, deployable application — built with an audience driving the decisions. That's Kiro.
