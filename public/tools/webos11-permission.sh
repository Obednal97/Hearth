#!/bin/sh
# webOS 11: let Hearth use the Homebrew Channel service (boot hook for /var/lib/webosbrew/init.d).
#
# On webOS 11 an app may only call luna://org.webosbrew.hbchannel.service/exec when its Luna client
# permissions include the group org.webosbrew.hbchannel.service.group (the Homebrew Channel app has it).
# The app installer writes Hearth's permission file without it, so every command Hearth runs is refused
# ("the TV refused the command") and the live app list, wallpapers from storage, the Home-button helper,
# the TV input, the LG logo switch and Uninstall are greyed out. Older webOS versions don't need this.
#
# The installer writes the file again on every install or update of Hearth, so this runs at each boot:
# it adds the group if it is missing and asks the Luna hub to reload its permissions.
#
# Install, once, over SSH on the TV (the script is inside the Hearth app; it copies itself to the boot folder):
#   sh /media/developer/apps/usr/palm/applications/tld.my.customlauncher/tools/webos11-permission.sh
# Or from a computer:
#   scp -O webos11-permission.sh root@TV_IP:/var/lib/webosbrew/init.d/40-hearth-permission
#   ssh root@TV_IP 'chmod 755 /var/lib/webosbrew/init.d/40-hearth-permission; sh /var/lib/webosbrew/init.d/40-hearth-permission'
# Undo: delete /var/lib/webosbrew/init.d/40-hearth-permission and reinstall Hearth.
#
# Original by ganondorft (Hearth pull request #6). Changes: installs itself when run by hand; the group is only
# added after an existing entry, so an empty list can never turn into broken JSON.

GROUP=org.webosbrew.hbchannel.service.group
F=/var/luna-service2-dev/client-permissions.d/tld.my.customlauncher.app.json
HOOK=/var/lib/webosbrew/init.d/40-hearth-permission

case "$0" in
	*/init.d/*) ;;
	*)
		if [ -d /var/lib/webosbrew/init.d ]; then
			cp "$0" "$HOOK" && chmod 755 "$HOOK" && echo "installed: $HOOK"
		else
			echo "no /var/lib/webosbrew/init.d: is the Homebrew Channel installed?"
		fi
		;;
esac

[ -f "$F" ] || { echo "Hearth is not installed"; exit 0; }
grep -q "$GROUP" "$F" && { echo "permission already there"; exit 0; }
sed -i "s/\"\]}\$/\",\"$GROUP\"]}/" "$F"
if grep -q "$GROUP" "$F"; then
	/usr/sbin/ls-control scan-services >/dev/null 2>&1
	echo "permission added; close and reopen Hearth"
else
	echo "could not add the permission (unexpected file format)"
fi
exit 0
