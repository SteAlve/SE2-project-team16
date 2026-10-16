TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done 
- Total points committed vs done 
- Nr of hours planned vs spent (as a team)

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on Git
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_  |          |   -    |            |              |
| _#1_   |         |       |            |              |
| _#2_     |         |        |            |              |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |      |       | 
| Actual     |      |       |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated
  - Total hours spent
  - Nr of automated unit test cases 
  - Coverage
- E2E testing:
  - Total hours estimated
  - Total hours spent
  - Nr of test cases
- Code review 
  - Total hours estimated 
  - Total hours spent  


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
  - We didn't finish both stories: only story 1 (Get ticket) was completed. We split our effort across two stories, and some tasks were blocked waiting on others.

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

> Propose one or two

- One thing you are proud of as a Team!!
  - Our organization was superb: it let us deliver story 1 (Get ticket) end to end (frontend, API, database and tests, all running automatically in CI) and merge it into `main`.
  - The architecture and the documentation we wrote gave us an organized path to follow: everyone knew where each piece of code belongs and how the parts connect.
