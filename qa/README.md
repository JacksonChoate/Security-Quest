# Security+ Quest tests

Automated browser tests for the game. They load the real game files in headless Microsoft Edge and drive it by clicking buttons and pressing keys.

| Page | Window sizes | What it checks |
|---|---|---|
| `smoke.html` | 1366x768, 1920x1080 | Plays through every screen and mode (zone battles, campaign, exams, PBQs and sims, flashcards, Codex, profile, plan, settings, pause, themes, skins) and checks save export/import, reset and the question data. Reports JavaScript errors and screens that overflow. |
| `finish.html` | 1366x768, 1920x1080, 2048x1280, 390x844 | Plays every mode to its normal end (zone win and loss, rematch, Weak Spots, daily, story chapter win and loss, Packet Defender game over, Blitz time-up, quiz submit, full-exam time-out, PBQ Lab, a full flashcard round) and returns to the map. After each, checks the map scene is running, the game loop is ticking, WASD moves the player, the canvas fills its frame, and nothing logged an error. |
| `resize.html` | parent 2100x1400 | Loads the real `index.html` in an iframe and resizes the iframe (a real window resize for the game) on the map, mid-battle, inside Flashcards (canvas hidden) and in Packet Defender, at 1366x768, 1920x1080, 800x600, 390x844, 2048x1280 and 1024x1366. Checks canvas fit, the game loop, movement and no sideways page scroll. |
| `unlock.html` | 1366x768, 390x844 | Unlock pop-ups for every type (rank, skin, theme, achievement, chapter): none for starting items, queued one at a time with ranks first, map/battle paused while open and resumed after Enter / Esc / [ CLOSE ], [ EQUIP NOW ] for skins and themes, nothing shown mid-question or while the pause menu is open, Esc does not open the pause menu, reduced motion drops the glitch, and each unlock shows only once, even after reloading the save. Other pages close pop-ups automatically, like a player. |
| `flash.html` | 1366x768, 390x844 | Multiple-choice flashcards: 3 distinct same-category choices with one correct, reverse cards, varied and plausible wrong answers, keys 1-3 / Enter / [ next ], spaced repetition and re-queueing, and the screen fits. |
| `leave.html` | 1366x768, 2048x1280, 390x844 | Leaves every mode part-way, the way a player does, and checks the map comes back with no other scene left running (the "black map" bug), and that story progress is saved and can be resumed. |

## Run

From the `security-quest` folder:

```
powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1
powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Only finish,resize
powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Only finish -Sizes 2048x1280
```

A page lists its window sizes in `<meta name="qa-sizes" content="1366x768,...">` (default 1366x768); `-Sizes` overrides them. Reports go to `qa/out/<page>@<size>.txt` (ignored by git). The exit code is 0 when everything passes. The full suite takes several minutes.

## Writing a new test page

- Copy the header of an existing page: `<base href="../">`, the `?run=1` guard, and the error capture.
- Set `window.QA_TIMER_LOOP=true` in the first script (or load `index.html?qa-timer-loop=1` in an iframe). Headless Edge with virtual time barely runs animation frames, so without this the Phaser loop does not really run and movement, resizing and in-game errors go untested.
- Write the report into `<pre id="qaout">`: errors, then a `---` line, then `PASS` / `FAIL` / `STUCK` / `ok` lines.
- Call `App.game.loop.stop()` just before writing the report. The runner's virtual-time budget only ends early when the page goes idle; a running game loop would otherwise use the whole budget.

## Safety

The test pages clear saved progress before they run. In Edge and Chrome all local `file://` pages share the same storage, so the pages refuse to start unless the runner opens them (it adds `?run=1` and uses a separate, temporary browser profile). Do not remove that guard.

## Notes

- The pages need an internet connection, because the game loads Phaser from cdnjs.
- `PANEL-SCROLL` lines in a report are informational: they note screens whose panel scrolls internally (for example Codex lists). They do not fail the run.
