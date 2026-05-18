# repobridge

Fetch source code for packages and repositories into a local cache, then print stable paths that coding agents and other tooling can read.

`repobridge` is a Go CLI distributed through npm. The npm entrypoint selects the native binary for the current platform and runs it with inherited stdio.

## Installation

```bash
pnpm add -g repobridge
```

During local development in this repository:

```bash
cd packages/repobridge
pnpm build
node bin/repobridge.js --version
```

`pnpm build` cross-compiles all binaries expected by the npm shim so the package is self-contained on supported platforms. Use `pnpm build:native` when you only need to refresh the current host binary during local development.

## Commands

```bash
repobridge fetch <spec...>
repobridge path <spec...>
repobridge list [--json]
repobridge remove <spec...>
repobridge clean
```

- `fetch` downloads source code into the cache.
- `path` fetches on cache miss and prints the absolute source path.
- `list` shows cached packages and repositories.
- `remove` removes one or more cached sources.
- `clean` removes cached sources, optionally scoped by flags such as `--packages`, `--repos`, `--npm`, `--pypi`, and `--crates`.

Most commands that resolve package versions accept `--cwd` to choose the directory used for lockfile detection. `fetch` also accepts `--quiet`; `path` accepts `--verbose`.

## Supported Inputs

Package inputs default to npm:

```bash
repobridge path react
repobridge path react@19.0.0
repobridge path @scope/package@1.2.3
```

Use a registry prefix for non-npm packages:

```bash
repobridge path pypi:requests
repobridge path pypi:requests==2.32.3
repobridge path crates:serde@1.0.217
```

Repository inputs can use common shorthand or full URLs:

```bash
repobridge path vercel/next.js
repobridge path github.com/vercel/next.js
repobridge path gitlab.com/group/project
repobridge path bitbucket.org/workspace/repo
repobridge path https://github.com/vercel/next.js
```

Supported package registries are npm, PyPI, and crates.io. Supported repository hosts are GitHub, GitLab, and Bitbucket.

## Environment Variables

- `REPOBRIDGE_HOME`: Cache directory. Defaults to `~/.repobridge`.
- `GITHUB_TOKEN`: Token used for GitHub API calls and private GitHub repository fetches.
- `GITLAB_TOKEN`: Token used for private GitLab repository fetches.
- `BITBUCKET_TOKEN`: Token used for private Bitbucket repository fetches.

## Cache Layout

The cache contains cloned source trees and a `sources.json` index under `REPOBRIDGE_HOME`. Fetched repositories have their `.git` directory removed so the cache is a source snapshot rather than a nested working tree.
