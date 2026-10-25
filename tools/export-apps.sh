#!/bin/sh
# Run ON A ROOTED TV:  ssh root@<tv-ip> 'sh -s' < tools/export-apps.sh > apps.tsv
# Prints one line per installed app: id, title, icon file (tab separated), read from the TV's own app list.
# Use it to fill src/config/catalog.local.ts (see the README), or send it to grow Hearth's built-in list.
# Written without a TV to test on: if a line looks wrong, send me the raw output of
#   luna-send -n 1 luna://com.webos.applicationManager/listLaunchPoints '{}'
luna-send -n 1 luna://com.webos.applicationManager/listLaunchPoints '{}' | tr '{' '\n' | grep '"id"' | while IFS= read -r line; do
  id=$(printf '%s' "$line" | sed -n 's/.*"id": *"\([^"]*\)".*/\1/p')
  title=$(printf '%s' "$line" | sed -n 's/.*"title": *"\([^"]*\)".*/\1/p')
  icon=$(printf '%s' "$line" | sed -n 's/.*"largeIcon": *"\([^"]*\)".*/\1/p')
  [ -n "$icon" ] || icon=$(printf '%s' "$line" | sed -n 's/.*"icon": *"\([^"]*\)".*/\1/p')
  printf '%s\t%s\t%s\n' "$id" "$title" "$icon"
done
