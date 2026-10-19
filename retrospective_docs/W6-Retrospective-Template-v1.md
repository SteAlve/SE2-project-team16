SPRINT RETROSPECTIVE - Team 16
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: **2 committed / 1 done**
- Total points committed vs done: **9 committed / 8 done**
- Nr of hours planned vs spent (as a team): **55h 00m planned / 60h 07m spent**

**Remember**  a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
  - 197 tests pass successfully

- Code review completed
  - done by reviewing the pull request on github for each implemented code

- Code present on Git
  - `feature` -> `dev` -> `qa` -> `main` for the demo
    - feature may be closed after pull request

- End-to-End tests performed
  - Main flow
    - S1. The customer sees the services
    - S2. The customer gets a ticket
    - S3. The customer goes back to the services
  - Unique codes
    - S4. Two customers of the same service get different codes
    - S5. Each service counts on its own
    - S6. Reloading the ticket page doesn't give a new ticket
  - Queue update
    - S7. A new ticket joins the end of its queue
  - Error cases
    - S8. No services set up yet
    - S9. The server is down
    - S10. The ticket page is opened without picking a service
    - S11. The service doesn't exist anymore
    - S12. The numbering starts again after the last ticket of the day


#### Refined Definition of Done (from next sprint)

Based on the Agile Manifesto principles: *"Working software is the primary measure of progress"* and *"Continuous attention to technical excellence and good design enhances agility"*.

A story is done only when **all** of the following are true:

- **Working software**
  - All acceptance criteria of the story are met.
  - **All** E2E scenarios of the story pass (no exceptions, edge cases included). A failing scenario means the story is not done.
- **Technical excellence**
  - Unit and integration tests are written for the new code and all tests pass in CI.
- **Team review**
  - The PR is reviewed and approved by at least one other team member before merging.
- **Integrated and demo-ready**
  - The code is merged through `feature` -> `dev` -> `qa` -> `main` and the branch is up to date with `dev` before the PR.
  - The story runs on `main` and can be shown to the Product Owner in the demo.


### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_ (technical tasks)  | 13 |   -    | 28h 30m | 27h 40m |
| _#1_ Get ticket (OQM-1) | 15 |   8    | 24h 30m | 28h 42m |
| _#2_ Next customer (OQM-4) | 2 |   1    | 2h 00m  | 3h 45m  |
| **Total**               | **30** | **9** | **55h 00m** | **60h 07m** |
   

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation | 1h 50m (1.83h) | 2h 02m (2.04h) | 
| Actual     | 2h 00m (2.00h) | 2h 00m (2.00h) |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

    $$\frac{60h\,07m}{55h\,00m} - 1 = \frac{60.12}{55.00} - 1 \approx 0.093 \; (+9.3\%)$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}} - 1 \right|$$

    $$\frac{1}{30}\sum_{i=1}^{30} \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| \approx 0.399 \; (39.9\%)$$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 5h
  - Total hours spent: 5h 55m
  - Nr of automated unit test cases: 197
  - Coverage: 97.81% Statements; 94.28% Branches; 100% Functions; 97.84% Lines
- E2E testing:
  - Total hours estimated: 8h 30m
  - Total hours spent: 7h 45m
  - Nr of test cases: 12
- Code review 
  - Total hours estimated: 0
  - Total hours spent: Not tracked


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - Review time wasn't estimated: reviewing code and documents took real time, but no task included it.
  - Some tasks were duplicated or overlapping (e.g. two "DB test" tasks). During sprint planning not everyone spoke up, so the tasks weren't discussed enough as a team.
  - We worked on two stories at the same time instead of finishing the first one before starting the second.
  - Dependencies between tasks weren't planned: some tasks had to wait for others (the E2E tests waited for the frontend, the API waited for the DAOs).

- What lessons did you learn (both positive and negative) in this sprint?
  - Positive: reviewing every PR before merging caught real problems early, for example a PR targeting the wrong branch and a duplicated setup.
  - Positive: the tests at every level, running automatically in CI, make us confident when merging.
  - Negative: we have to plan the dependencies between tasks and include code review in the plan, so that nobody stays blocked and we can move on to the next task.
  - Negative: branches have to be kept up to date with `dev` before opening a PR.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  - This was our first sprint, so there were no previous goals.
  
- Which ones you were not able to achieve? Why?
  - We didn't finish either story: only story 1 (Get ticket) was presented but was not done by definition (it didn't pass all 12 E2E tests). We split our effort across two stories, and some tasks were blocked waiting on others.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  1. Plan the sprint better, with clear tasks, no duplicates and no bottlenecks:
     - Decide together how many stories to commit to, and finish one before starting the next.
     - Only one member creates the tasks in YouTrack, after everyone has discussed them in sprint planning.
     - Every task has a good description: what to do, "done when...", and the tasks it depends on.
     - Include the code review time in each task's estimate and description.
     - Give each task a deadline, so the tasks that others depend on are finished in time and nobody becomes a bottleneck.
  2. Organize the team by area, and work in parallel:
     - Make small sub-teams for backend, frontend and database.
     - While one person implements, another reviews and another tests, so a story moves forward without waiting.


- One thing you are proud of as a Team!!
  - Our organization was superb: it let us deliver story 1 (Get ticket) end to end (frontend, API, database and tests, all running automatically in CI) and merge it into `main`.
  - The architecture and the documentation we wrote gave us an organized path to follow: everyone knew where each piece of code belongs and how the parts connect.
