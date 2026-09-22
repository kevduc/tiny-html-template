# Releasing

## One-time `0.1.0` bootstrap

A package must already exist on npm before npm can configure a trusted publisher for it. The `0.1.0` release is therefore a separately authorized, manual interactive bootstrap. Do not create a GitHub release for this version.

From the repository root, verify the exact bootstrap candidate:

```sh
corepack enable pnpm
pnpm install --frozen-lockfile --ignore-scripts
pnpm run verify
```

After separate authorization to publish, the repository owner runs `pnpm publish --access public` from the verified repository root. The GitHub Actions publish workflow must not publish `0.1.0`.

Versions after `0.1.0` use the release workflow with this exact npm trusted publisher and protected GitHub `npm` environment:

- GitHub repository: `kevduc/tiny-html-template`
- Workflow file: `publish.yml`
- GitHub environment: `npm`

The GitHub `npm` environment requires a reviewer and deployment restrictions that allow only the protected `main` branch and version tags matching `v*`. Do not add an npm token as a repository, environment, or workflow secret. The workflow uses GitHub OIDC only.

## Automated releases

Create every version after `0.1.0` only by publishing a GitHub release from a version tag. The tag must exactly match `v` followed by `package.json`'s version and point to a commit reachable from `main`.

The release workflow checks out the exact tag, rejects an already published package version, validates the packed artifact, and publishes that exact tarball with OIDC provenance. Pull request, fork pull request, dependency-update pull request, and branch-push workflows do not receive publication credentials.
