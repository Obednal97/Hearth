// local build: switches for this fork's build. Upstream's code stays in the tree, gated here, so rebases stay small.

/** Check for updates installs the plain GitHub release, which would replace this build and drop our own commits. */
export const UPDATES_ENABLED = false;

/** 2.2 takes the old key filter ("Reassign remote buttons") out once and asks for the buttons to be mapped again with the key
 *  engine. Our TV's map (app buttons to apps) works on the filter, so it stays: the clean-up never runs (lib/remapgone.ts). */
export const KEEP_KEY_FILTER = true;
