# Security+ Quest tests

Automated browser tests for the game. They load the real game files in headless Microsoft Edge and drive it by clicking buttons.

| Page | What it checks |
|---|---|
| `smoke.html` | Plays through every screen and mode (zone battles, campaign, exams, PBQs and sims, flashcards, Codex, profile, plan, settings, pause, themes, skins) and checks save export/import, reset and the question data. Reports JavaScript errors and screens that overflow at 1366x768. |
| `flash.html` | Multiple-choice flashcards: every question has 3 distinct same-category choices with one correct, reverse cards appear, wrong answers vary and are plausible, keys 1-3 / Enter / [ next ] work, wrong answers reset the card's spaced-repetition box and re-queue it, and the screen fits. |
| `leave.html` | Leaves every mode part-way, the way a player does, and checks that the map comes back with no other scene left running (the "black map" bug), and that story progress is saved and can be resumed. |

## Run

From the `security-quest` folder:

```
powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1
powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Only leave
```

Reports are written to `qa/out/` (ignored by git). The exit code is 0 when everything passes.

## Safety

The test pages clear saved progress before they run. In Edge and Chrome all local `file://` pages share the same storage, so the pages refuse to start unless the runner opens them (it adds `?run=1` and uses a separate, temporary browser profile). Do not remove that guard.

## Notes

- The pages need an internet connection, because the game loads Phaser from cdnjs.
- `PANEL-SCROLL` lines in a report are informational: they note screens whose panel scrolls internally (for example Codex lists). They do not fail the run.
