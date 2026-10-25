# Replace LG Home with a script and SAM

Hearth is mounted in LG Home's own place, so the TV never opens LG Home. The app is a small black page
(`shim.html`) that the TV believes is LG Home (`com.webos.app.home`); it opens Hearth at once.

Files on the TV (written by the launcher, nothing to copy by hand):

| What | Where |
|---|---|
| script, shim page, switched-on flag | `/media/developer/launcher-takeover/` |
| start-at-boot link | `/var/lib/webosbrew/init.d/47-launcher-takeover` |
| the mount | over `/usr/palm/applications/com.webos.app.home` (memory only) |
| log | `/tmp/launcher-takeover.log` (a copy that survives a restart: `/media/developer/launcher-takeover-last.log`) |
| the watcher that opens Hearth (pid) | `/tmp/launcher-takeover-watch.pid` |
| permission to restart the app manager | `/media/developer/launcher-takeover/allow-restart` |
| note that a restart was needed | `/media/developer/launcher-takeover/method` (contains `restart`) |
| a start-up takeover not yet seen to finish | `/media/developer/launcher-takeover/boot-attempt` |

## Restarting the app manager (SAM)

webOS 7 has no gentle way to make the TV's app manager (SAM) read the replacement: it has no `blockSystemApp`,
`releaseBlockSystemApp` or `scan` call, and no `profile.blockedAppList` in configd (confirmed from a log taken on a
webOS 7.0.0 TV). Where a gentler way exists (configd's list, or `blockSystemApp`), it is used first. Otherwise SAM is
restarted, the way Glasshouse does it: systemd's failure counters are cleared, the AirPlay helper (`LunaExecutable`) is
killed, SAM is killed so systemd starts it again, anything that depended on it and was refused a restart is started, and
the app that was in front is opened again. The screen may blink for a few seconds. Switching the method off needs one more restart.

Choosing the method in Settings is the permission to restart SAM (the launcher writes `allow-restart`). Run by hand
without that file, `takeover.sh on` refuses with `needs-restart` and changes nothing.

How Home opens Hearth: the stand-in page is plain black and has no script, because a web app that carries LG Home's id gets no
answer to Luna calls (every call from its page timed out). A watcher running as root is told by the TV that the stand-in is in
front and opens Hearth. It is started as early as possible, before the mount exists, where it works like the helper script;
it is stopped before SAM is restarted and started afresh after. Hearth marks itself alive (`/tmp/launcher-alive`) whenever it is on
screen, and a checker asks again (closing Hearth first on the third ask) if Hearth was asked for and did not show itself.

Safety nets: with no permission and no gentle way, it refuses up front and changes nothing. If a start-up takeover that needed a
restart never finishes (a black screen, a power-cycle), `boot-attempt` is still there at the next start, and the takeover then
switches itself off and leaves LG Home alone. After six failed asks for Hearth it switches itself off. The "LG Home" tile does
nothing on such a TV (it would need a second restart).

## If Home or Back gives a black screen

The stand-in is only a black page ("Opening Hearth..." in grey); it cannot open Hearth itself, because a web app that carries
LG Home's id gets no answer to Luna calls. A watcher running as root does it. Over SSH:

    grep -i 'watch\|verify' /tmp/launcher-takeover.log | tail -n 30
    sh /media/developer/launcher-takeover/takeover.sh diagnose
    luna-send -n 1 luna://com.webos.applicationManager/getForegroundAppInfo '{}'

The diagnose output says whether the watcher is running. To get out of it:

    sh /media/developer/launcher-takeover/takeover.sh off

## If something is stuck: undo over SSH

Log in interactively (`ssh root@<TV-IP>`), then run the commands one level at a time, stopping when the TV is back to normal.

**1. The normal way** (puts LG Home back without restarting anything):

    sh /media/developer/launcher-takeover/takeover.sh off

**2. Look at what is going on** (paste the output when reporting a problem):

    sh /media/developer/launcher-takeover/takeover.sh diagnose

**3. By hand, if the script is missing or does not answer** (does not need luna-send):

    rm -f /var/lib/webosbrew/init.d/47-launcher-takeover
    rm -f /media/developer/launcher-takeover/enabled
    umount /usr/palm/applications/com.webos.app.home || umount -l /usr/palm/applications/com.webos.app.home
    reboot

**4. Black screen and SSH works but nothing else does:** the same as 3 (the reboot restarts sam, which reads LG's own manifest again). The mount is in memory only, so after the
link and flag are gone, any restart gives LG Home back. Order matters: remove the link and flag first, otherwise the
start-at-boot step puts the stand-in back.

**5. No SSH at all:** unplug the TV for 30 seconds. The mount does not survive that, but the start-at-boot link puts
the stand-in back about 25 s after it starts; if Hearth works, use Settings → Options → Replace LG Home with a script and SAM to
switch it off. If Hearth does not open either, the stand-in switches itself off after three failed attempts to open it.

**Remove every trace** (after step 1 or 3):

    rm -rf /media/developer/launcher-takeover
