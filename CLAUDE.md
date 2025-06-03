# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Testing and Quality:**

- `deno test` - Run all tests
- `deno task lint` - Lint code with Deno
- `deno task format` - Format code with Deno (writes changes)
- `deno task typecheck` - Type check with TypeScript

**Development Usage:**

- `deno task report daily` - Show daily usage report
- `deno task report session` - Show session-based usage report
- `deno task report daily --json` - Show daily usage report in JSON format
- `deno task report session --json` - Show session usage report in JSON format
- `deno run --allow-read --allow-env index.ts` - Direct execution for development

## Architecture Overview

This is a CLI tool that analyzes Claude Code usage data from local JSONL files stored in `~/.claude/projects/`. The
architecture follows a clear separation of concerns:

**Core Data Flow:**

1. **Data Loading** (`data-loader.ts`) - Parses JSONL files from Claude's local storage, including pre-calculated costs
2. **Token Aggregation** (`calculate-cost.ts`) - Utility functions for aggregating token counts and costs
3. **Command Execution** (`commands/`) - CLI subcommands that orchestrate data loading and presentation
4. **CLI Entry** (`index.ts`) - Gunshi-based CLI setup with subcommand routing

**Output Formats:**

- Table format (default): Pretty-printed tables with colors for terminal display
- JSON format (`--json`): Structured JSON output for programmatic consumption

**Key Data Structures:**

- Raw usage data is parsed from JSONL with timestamp, token counts, and pre-calculated costs
- Data is aggregated into either daily summaries or session summaries
- Sessions are identified by directory structure: `projects/{project}/{session}/{file}.jsonl`

**External Dependencies:**

- Uses local timezone for date formatting
- CLI built with `gunshi` framework, tables with `cli-table3`

## Code Style Notes

- Uses Deno's built-in formatter with tab indentation and double quotes
- TypeScript with strict mode
- No console.log allowed except for output display
- Error handling: silently skips malformed JSONL lines during parsing
- File paths always use Deno's std/path utilities for cross-platform compatibility

# Tips for Claude Code

- [gunshi](https://gunshi.dev/llms-full.txt)
- do not use console.log. use logger.ts instead

# important-instruction-reminders

Do what has been asked; nothing more, nothing less. NEVER create files unless they're absolutely necessary for achieving
your goal. ALWAYS prefer editing an existing file to creating a new one. NEVER proactively create documentation files
(*.md) or README files. Only create documentation files if explicitly requested by the User. Dependencies should always
be added as devDependencies unless explicitly requested otherwise.
