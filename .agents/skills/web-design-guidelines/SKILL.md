---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Pakiernia adaptation (2026-11-02): the rules source is vendored and pinned locally. Do not fetch mutable instructions automatically. Source and licensing: UPSTREAM-NOTICE.md and the repository skills lock manifest.

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the pinned local guidelines from `references/guidelines.md`
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Use the reviewed local snapshot for each review:

```
references/guidelines.md
```

Pinned upstream revision: 434b7f91364665f2f733b310ec54809bf8f37937. The local file contains rules and output format instructions. A future update requires source/diff/license review and a lock-manifest update. Pakiernia's brief, data protection and mobile ergonomics take precedence over generic conventions (including title case, URL routing and uncontrolled-input suggestions).

## Usage

When a user provides a file or pattern argument:
1. Read `references/guidelines.md`
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
