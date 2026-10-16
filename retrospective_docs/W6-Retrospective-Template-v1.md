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
  - 197 tests pass successfully

- Code review completed
  - done by reviewing the pull request on github fro each implemented code

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

  - all passed ecxept for the last one (S12), tiket P-999 -> error, not P-999 -> P-000

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

- What lessons did you learn (both positive and negative) in this sprint?

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> Propose one or two

- One thing you are proud of as a Team!!