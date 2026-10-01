# Features and design rules

This is the checklist of what the game does and the rules behind it. When you change a mode or add a new one, go through it so nothing the other modes already support gets lost.

## Shared by every mode

| Feature | Notes |
|---|---|
| HUD | Level number, a star per goal, pause and mute buttons. One row on wide screens, two rows on narrow or portrait ones; the stars pill only takes the width it needs. |
| Level banner | Cheer, the new level number and mini insects, shown on a clear screen. |
| Pause | Pause button, `Esc` / `P`, and automatic pause when the app goes to the background. Everything freezes, including timers waiting to spawn. While any card is open, the buttons behind it can't be reached with Tab or pressed with Space. |
| Mute | Plays a short confirmation tone before muting. |
| End screen | Confetti, then "Play again" restarts by itself after 10 seconds. Challenge has its own score screen. |
| Net cursor | The net follows the mouse and hides the system pointer; on touch it swoops in where the finger lands. |
| Cards that fit | Menu and end cards shrink step by step (smaller picture, tighter gaps, then no button subtitles) until they fit the screen. Only if they still can't does a chunky, rounded kid scrollbar with arrow buttons appear. |
| Screen scaling | Speeds, insect sizes and the net scale with the screen; large monitors zoom the HUD, cards and banner. |
| Languages | Arabic and English, no text in the HTML, right-to-left layouts mirror automatically. |
| Scenes | Each mode has its own sky and ground, and the colours glide between them when a mode starts. |
| Light | Clouds passing the sun dim the scenery slightly (not in the butterfly garden, which has a clear sky). |
| Offline and updates | Installable app; every file is cached by `sw.js`. It is switched off on localhost so development reloads always show the latest files. The app checks for a new version whenever it comes back on screen; when one is ready, an "Update the game" pill (press-and-hold) appears on the menu and reloads into it. |
| Privacy | `privacy.html`, in Arabic and English, linked quietly from the menu footer: the game collects nothing; only the language, best Challenge score, last What's new version and the offline copy stay on the device. Its big green button goes back to the game, so an installed app (no browser back button) never gets stuck there. Update its date and list whenever the game starts saving something new. |
| What's new | Gift pill on the menu, next to the language pill (press-and-hold); it wiggles with a dot while there is a version the child hasn't seen. The screen shows one animated picture per version that changed something a child can see, newest first: tapping a picture makes it jump and plays that version's sound, ▶ starts that mode, and a twinkling star marks versions not seen yet. A short line under each picture is for grown-ups. Add an entry to `NEWS` in `js/game.js` (plus its text in both language files) for each release a child would notice. |
| Reduced motion | Clouds, confetti, idle button motion, wing flapping and glows stop when the device asks for less motion. |

## Per mode

✅ supported · ⚪ deliberately different · — not applicable

| Feature | 🪰 Flies | 🐝 Bees | 🦋 Butterflies (both modes) | 🐜 Ants | 🏆 Challenge |
|---|---|---|---|---|---|
| Soft collisions (no overlap, bounce away) | ✅ | ✅ | ✅ | — at most two ants out | ✅ |
| Varied insect sizes | ✅ | ✅ | ✅ | ⚪ one size; nearer ants look bigger | ✅ smaller |
| Entering from the screen edges | ✅ | ✅ | ✅ | ⚪ come out of the anthill | ✅ |
| Wobbly, natural flight | ✅ buzzing zig-zag | ✅ | ✅ slow bobbing flutter | ⚪ walk with moving legs | ✅ |
| Stereo sound that follows each insect | ✅ buzz | ✅ hum | ✅ soft wing flutter, faster when scared or carried, quiet on its flower | ⚪ drop, munch and home sounds | ✅ |
| Resting on the glass | ✅ | ✅ | ⚪ only on its flower | — | ✅ |
| Catch animation | squash, sparkle, dizzy slide | same | ⚪ one quick upward scoop puts it inside the net's bag, then the net carries it and tips it onto the flower | ⚪ no catching: the ant eats a bite and carries the rest home | same |
| Several in one swing (combo) | ✅ | ✅ | ✅ every matching one under the net, up to what the flower still needs | — | ✅ with points |
| Wrong tap | — | "هذه نحلة!" badge, red edge glow, "لاء" voice | Watch the colours only: "ليست هذه الفراشة!" badge, red edge glow, "لاء" voice; the butterfly flutters away and the flower nudges | — nothing is wrong; a third food just sparkles | — |
| Hint when the child is stuck | — | — | ✅ matching butterflies glow after 4 s | ✅ an ant peeks out after 6 s, a hungry bubble after 12 s | — |
| Clouds | ✅ | ✅ | ⚪ clear sky | ✅ | ✅ |

## Rules for toddlers (ages 2–4)

1. **Nothing depends on reading.** Kid buttons carry pictures of the game's own insects; feedback is visual and audible.
2. **Grown-up controls are protected.** Challenge, Install, Update, What's new and the language switch need a press-and-hold; a quick tap only wiggles the pill and shows a hint bubble.
3. **Gentle feedback.** No scolding sounds except the "No!" warning, which teaches "not the bee" and "not this butterfly".
4. **Difficulty rises in even steps.** Level 1 is the reference; each later level is one small step harder.
5. **Keep the screen calm.**
   - Butterfly garden shows at most two flowers, always in the same spots.
   - Never more matching butterflies in the air than a flower still needs, and a full flower's colour stops coming, so it never turns "wrong".
   - The screen clears between stages before the new one starts. In the butterfly garden it also clears between flowers: every butterfly flies off and the flower wilts before the next flower grows.
6. **Choosing comes in small steps.** In the butterfly garden, levels 1–2 have no wrong butterfly at all; level 3 is the first real choice. Every flower gets a random colour; colours not shown yet come first and the last flower's colour is avoided. Levels 1–3 use only red, blue and yellow; purple joins in levels 4–5, and a blue flower never shares the screen with purple butterflies (or the other way round).
7. **Colour-blind friendly.** Each butterfly colour wears a real butterfly's markings, repeated on the flower's petals, so matching also works by shape.
8. **Counts are visible.** The flower's counter shows a number (`1/2`) and mini butterflies in the flower's colour.

## Butterfly modes

**Butterfly garden** (easy): every butterfly has a flower of its colour, so nothing is ever wrong.

| Level | Flowers at once | Per flower | Most in the air | Flowers in the level |
|---|---|---|---|---|
| 1 | 1 | 2 | 2 | 3 |
| 2 | 2 | 2 | 3 | 6 |
| 3 | 1 | 3 | 3 | 4 |
| 4 | 2 | 3 | 3 | 6 |
| 5 | 2 | 3 | 4 | 6 |

**Watch the colours** (choosing):

| Level | Butterfly colours | Flowers at once | Colours with no flower | Most in the air | Per flower | Flowers in the level |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 0: every butterfly is right | 2 | 2 | 3 |
| 2 | 2 | 2 | 0: every butterfly is right, each goes to its own flower | 3 | 2 | 6 |
| 3 | 2 | 1 | 1: first real choice | 3 | 2 | 3 |
| 4 | 3 | 2 | 1 | 4 | 2 | 6 |
| 5 | 4 | 2 | 2 | 4 | 2 | 6 |

Butterflies fly in one at a time, 1–1.8 s apart (at least 2 s after a catch), and "most in the air" is a hard cap that also counts ones still flying away. A caught butterfly always flies to the flower of its own colour. With two flowers, a full one wilts away on its own while the other stays where it is. Tapping a colour that has no flower gets the "No!" warning; tapping one whose flower is already full just makes it flutter off.

| Colour | Modelled on | Markings |
|---|---|---|
| Red | Peacock butterfly | Big eyespots |
| Blue | Morpho | Dark border with white spots |
| Yellow | Swallowtail | Black tiger stripes |
| Purple | Purple emperor | White band and a small orange eyespot (levels 4–5 only) |

Colours are bold and far apart so a two-year-old can tell them apart. No green (a green flower vanishes against the grass), and no orange or pink (too close to red and yellow). Level 5 needs four colours, so its flowers are red and yellow and the wrong butterflies are blue and purple, the only mix with no close pair. Petals and wings use the full colour rather than a pale tint.

## Feed the ants

The child taps the ground and food drops there. One ant comes out of the anthill, walks to it, takes a bite and carries the rest home. At most two foods are out at once, so there are never more than two ants on screen. Each food brought home earns a star, and the anthill grows a little with every level.

| Level | New food | Stars |
|---|---|---|
| 1 | Sugar cube | 3 |
| 2 | White bread | 4 |
| 3 | Strawberry | 5 |
| 4 | Apple | 6 |
| 5 | Cookie | 6 |

Every food is something real ants go for. A dropped food is any of the ones unlocked so far. Ants walk a little faster each level. With nothing to feed for 6 s an ant peeks out and looks around; after 12 s it comes out with a thought bubble of the level's new food and a tummy rumble.

## Adding a mode

1. Add its menu button with a picture icon, and its strings to every file in `lang/`.
2. Give it a scene in `css/style.css` (light and both dark blocks).
3. Walk the "Per mode" table above and mark each row supported or deliberately different.
4. Check it on phone, tablet, laptop and a large monitor, in both languages.
5. Bump `VERSION` in `js/game.js` and `sw.js`.
