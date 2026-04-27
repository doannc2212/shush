# Shush

I built this as a small Chrome extension to scratch my own itch — sometimes I just want to silence a noisy tab for a little while without closing it. It lets you mute specific tabs for a set duration, so you can stay focused and come back to the sound when you're ready.

## What it does

You can quickly mute the current tab with a preset duration — 5m, 15m, 30m, 1h, 2h, or indefinitely. If you have several distracting tabs open at once, you can select and mute them all in one go. A live countdown shows how long each mute has left, and the tab unmutes itself automatically when the timer runs out, with a little desktop notification so you know. Mutes even survive a browser restart, so you don't have to worry about losing your session.

## What I'm thinking about next

There's a lot this could grow into. A few ideas I'd love to explore when time allows:

- a keyboard shortcut to mute/unmute without opening the popup
- domain rules, so you can automatically mute a site (like YouTube) after a set amount of time
- focus profiles — saved sets of tabs or domains to mute in one click
- scheduled muting during certain hours of the day
- simple usage stats, just to see how often focus mode actually helps
- custom duration presets beyond the built-in ones
- Firefox support — the extension is built on standard WebExtensions APIs, so a port should be fairly straightforward

If any of this sounds useful to you, or if you have ideas of your own, I'd genuinely love to hear them. Feel free to open an issue.

## License

MIT
