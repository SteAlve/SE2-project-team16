TEMPLATE FOR RETROSPECTIVE (Team ##)
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
- Code review completed
- Code present on Git
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_ (technical tasks)  | 13 |   -    | 28h 30m | 27h 40m |
| _#1_ Get ticket (OQM-1) | 15 |   8    | 24h 30m | 28h 42m |
| _#2_ Next customer (OQM-4) | 2 |   1    | 2h 00m  | 3h 45m  |
| **Total**               | **30** | **9** | **55h 00m** | **60h 07m** |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation | 1h 50m (1.83h) | 2h 02m (2.04h) | 
| Actual     | 2h 00m (2.00h) | 2h 00m (2.00h) |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

    $$\frac{60h\,07m}{55h\,00m} - 1 = \frac{60.12}{55.00} - 1 \approx 0.093 \; (+9.3\%)$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

    $$\frac{1}{30}\sum_{i=1}^{30} \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| \approx 0.399 \; (39.9\%)$$

  
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