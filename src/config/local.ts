// local build: switches for this fork's build. Upstream's code stays in the tree, gated here, so rebases stay small.

/** Check for updates installs the plain GitHub release, which would replace this build and drop our own commits. */
export const UPDATES_ENABLED = false;
