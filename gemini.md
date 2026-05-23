# AGENT BEHAVIORAL PROTOCOLS

## 1. POST-IMPLEMENTATION LOGGING (User Actions)
File: `TO_SIMO_DO.md`
Trigger: Before completing any task, analyze if the user requires MANUAL actions (e.g., set env vars, manual DB migration, API keys).
Action:
- If the file does not exist, create it.
- If manual actions are needed, APPEND them to the file clearly.
- If NO manual actions are needed, do NOT touch this file.

## 2. DYNAMIC DOCUMENTATION
File: `DOCUMENTATION.md`
Trigger: After every code implementation or architectural change.
Action:
- If the file does not exist, create it.
- APPEND a brief, professional summary of the changes using this format:
  - [Date/Time]: Feature/Fix Name
  - *Details*: What was changed and why.
  - *Tech Notes*: All the details such as: New dependencies, endpoints...

## 3. CONTEXT & STATE PERSISTENCE (Anti-Lazy Protocol)
Trigger: You are approaching the token budget limit or the context window is about to refresh.
Protocol:
- **Rule:** Your context window will be automatically compacted. NEVER stop a task artificially due to token concerns. Work indefinitely.
- **Action (State Dump):** Before the context refreshes, you MUST:
  1. Update `DOCUMENTATION.md`: Mark completed steps and explicitly define the *immediate next step* in a "Current Status" section.
  2. Update `TO_SIMO_DO.md`: If you are blocked, log it here.
  3. Save these files immediately.
- **Resume:** Upon context refresh, read `DOCUMENTATION.md` first to resume exactly where you left off.

## 4. AUTONOMOUS ERROR RECOVERY
Trigger: You encounter an error or the user reports a bug.
Protocol:
1. Analyze: Identify the root cause.
2. Fix: Apply the solution.
3. VERIFY: You MUST run a verification test (e.g., `npm run build`, start the server, or run a specific test case) in the terminal.
4. Report: Only hand back control to the user after you have confirmed the fix works or provided the output of the failed test.

## 5. AMBIGUITY HANDLING
Trigger: You are about to write code but requirements are vague.
Protocol:
- STOP immediately.
- Ask the user for specific clarification.
- Exception: If the user explicitly stated "be creative" or "decide for yourself", proceed with your best judgment.

## 6. HANDOVER PROTOCOL
Trigger: When you have completed ALL tasks, tests, and documentation updates.
Action:
- END your response explicitly with a status block.
- Format:
  ---
  STATUS: [COMPLETED / FAILED / WAITING FOR INPUT]
  NEXT ACTION: [Your suggestion for me]

## 7. DATABASE EXPERT
When using relational databases use the 'supabase-postgres-best-practices' skill to improve the output quality. If we are using supabase you also have to check the 'supabase' one.