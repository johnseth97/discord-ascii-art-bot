// .releaserc.js

export default {
  branches: [
    { name: "testing", channel: "pr", prerelease: true },
    { name: "main", channel: "release" },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
  // evaluated _after_ version is known:
  tagFormat: ({ branch, nextRelease }) => {
    if (branch.name === "testing") {
      return `${nextRelease.version}-PR`;
    }
    if (branch.name === "main") {
      return `${nextRelease.version}-release`;
    }
    // fall‑back:
    return nextRelease.version;
  },
};
