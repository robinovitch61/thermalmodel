# [thermalmodel.com](https://thermalmodel.com)

TODO:
- [x] Fix bug with dropdowns [5]
- [x] Change shift functionality to command/control (multi select, click and drag) [4]
- [x] Node color is temp [5]
- [x] Add the ability to change the plot/canvas/table size by dragging the borders [5]
- [x] Fix bug with runtime/timesteps not resetting [5]
- [x] More reasonable sig figs in plots (10th of degree) [5]
- [x] Theory explanation section/popup [5]
- [x] Differentiate between conduction and convection just for user tracking. Remove unidirectional option from app. No source/target terminology. [5]
- [x] Deal with math for radiative heat transfer (incomplete/wrong right now?) [5]
- [x] Limits on resizing panels [5]
- [x] Plot margin a percentage of domain rather than fixed val [5]
- [x] Multiple connection types per A <--> B connection (allow all combos except conduction + convection together) [5]
- [x] Clarify radiation resistance formula in theory [5]
- [x] Figure out why control-click not working on windows [5]
- [x] Remove unidirectional from hotstuff-network and standardize away from source/target naming [5]
- [x] Migrate to thermalmodel.com [5]
- [x] Disallow nodes being named the same thing [5]
- [x] Disallow selecting first/second node in connection table to generate duplicate [5]
- [ ] Test hotstuff-network to error if identical connections passed in (e.g 2x A-B, conduction)
- [ ] Visual validation on cell entries with tooltip describing invalid condition [5]
- [ ] Visual difference to single, double connection lines amongst cond/conv/rad [5]
- [ ] Heat transfer naming conventions correct (a to b, a is hotter than b to start) [5]
- [ ] Limit num points and/or compress appState to not hit limits on localStorage - do not store results in browser, run model before exporting everything [5]
- [ ] Optional notes field for nodes/connections in table.
- [ ] Logo + favicon [5]
- [ ] Fun default model (models?) [5]
- [ ] Tutorial popup instead of tutorial model [5]
- [ ] Resistance calculator [4]
  - [ ] Link to engineers edge website
  - [ ] Calculator pops up while editing
- [ ] Make node active when editing in table [4]
- [ ] Escape while editing cell exits and resets default val [4]
- [ ] Enter while editing cell exits same as tab [4]
- [ ] File export/import (falsdat doesn't have this) [4]
- [ ] Add info to canvas: [4]
  - Power gen for each node (number in middle)
  - Resistance between nodes (thickness changes with resistance)
- [ ] Make errors more visible than just in console, or just not possible to run if invalid anything [4]
- [ ] Copy/paste all selected with suffix to avoid nodes being named the same thing [4]
- [ ] Horizontal/vertical snap functionality for creating grid [1]
- [x] Reset all stored state button (with confirmation) - not important if not the tutorial [1]
