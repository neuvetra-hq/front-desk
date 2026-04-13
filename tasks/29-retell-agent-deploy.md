---
status: done
---
# Task 29: Retell Conversation Flow Agent — Full Build & Deploy

## What was done
- Updated `retell-sdk` from 5.7.0 → 5.12.0 (now has `SubagentNode` type)
- Fixed `webhooks.ts` to handle new conversation flow custom function format (`{ name, call, args }`) alongside old LLM webhook format (`{ event: "function_call", name, call, arguments }`)
- Wrote `apps/api/scripts/deploy-retell-agent.ts` — complete flow JSON + deploy script
- Deployed flow + agent to Retell via SDK

## IDs (live)
- **Conversation Flow:** `conversation_flow_f581aa0a8f5f`
- **Agent:** `agent_fb226744b23e3db72c14cf9112`

## Flow Architecture
- **Welcome Node** → 7 branches (Book, Reschedule, Cancel, FAQ, Emergency, Speak To Someone, Take Message)
- **Book**: SubagentNode with `check_availability` + `book_appointment` tools — LLM handles back-and-forth
- **Cancel**: FunctionNode(find_appointment) → branch(appointments exist?) → SubagentNode(confirm+cancel) or ConversationNode(not found)
- **Reschedule**: FunctionNode(find_appointment) → branch → SubagentNode(confirm+reschedule) or ConversationNode(not found)
- **Take Message**: ConversationNode(collect info) → FunctionNode(take_message API)
- **FAQ, Emergency Transfer, Speak To Someone, Wrap Up, Goodbye**: unchanged from canvas

## Key decisions
- Using `subagent` node type (not `conversation` with tool_ids) — compliant with April 18 deprecation
- All 6 tools POST to same `https://api.neuvetra.com/webhooks/retell` URL, dispatched by `name` field
- `find_appointment` uses `response_variables: { appointments_json: "appointments" }` to extract appointments array for branch condition
- `event_id` flows through LLM context from find_appointment result → cancel/reschedule SubagentNode — caller never speaks it
- FunctionNode `speak_during_execution: true` + tool `speak_after_execution: true` gives smooth "let me check..." → result flow

## Pending
- Set `RETELL_AGENT_ID=agent_fb226744b23e3db72c14cf9112` on Railway
- Set general webhook URL in Retell dashboard → `https://api.neuvetra.com/webhooks/retell`
- Test with a live call
