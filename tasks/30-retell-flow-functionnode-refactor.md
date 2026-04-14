---
status: done
---
# Task 30: Retell Flow — FunctionNode Architecture Refactor

## What was done
- Fixed Twilio webhook URL on Neuvetra's number (was pointing to dead ngrok URL from dev)
- Fixed `DATABASE_URL` on Railway to use Supabase transaction pooler (direct connection fails over IPv6)
- Added try/catch to `/voice` and `/retell` webhook handlers to prevent raw 500s from silently failing
- Added CRITICAL blocking rules to all 3 SubagentNodes (Book, Cancel, Reschedule) to prevent LLM from confirming without calling the tool
- Full refactor of conversation flow pushed via `scripts/refactor-retell-flow.ts`:
  - BOOK: SubagentNode (check_availability, collect info) → ExtractDynamicVariablesNode → FunctionNode (book_appointment) → ConversationNode (confirm)
  - CANCEL: FunctionNode (find_appointment) → ConversationNode (present/select) → ExtractDynamicVariablesNode (event_id) → FunctionNode (cancel_appointment) → ConversationNode (confirm)
  - RESCHEDULE: FunctionNode (find_appointment) → SubagentNode (select appt, check_availability) → ExtractDynamicVariablesNode (event_id, new_start_time) → FunctionNode (reschedule_appointment) → ConversationNode (confirm)
  - TAKE MSG: ConversationNode → ExtractDynamicVariablesNode → FunctionNode (take_message)
  - WRAP UP: routes back to all 5 tasks for multi-task calls
- Fetched and verified Retell docs for Logic Split Node, ExtractDynamicVariablesNode, Custom Functions
- Updated memory/skills with confirmed SDK types and node chain patterns

## Key decisions
- FunctionNodes are guaranteed to execute on node entry — no LLM skipping possible
- SubagentNodes retained only for back-and-forth conversations (availability check, slot negotiation)
- ExtractDynamicVariablesNode bridges conversation → guaranteed function call cleanly
- `response_variables` on find_appointment maps `appointments_json` → JSON path `"appointments"` so downstream nodes can use `{{appointments_json}}`
- `else_edge` on FunctionNodes (cancelFind, rescheduleFind) routes to "no appointments" ConversationNode when result is empty
- All tools inline in flow `tools[]` array, referenced by `tool_id` — visible in Retell canvas
