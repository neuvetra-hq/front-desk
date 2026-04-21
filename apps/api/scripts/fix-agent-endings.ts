#!/usr/bin/env bun
/**
 * Fix hang-up behavior for both the customer agent and Neuvetra agent.
 *
 * Root cause: WrapUp ConversationNode says goodbye, then waits for the CALLER
 * to speak again before evaluating edges. Caller is silent → agent hangs.
 *
 * Fix:
 *   - WrapUp instruction: ONLY asks "Is there anything else?" — no goodbye speech
 *   - WrapUp → End edge: fires on caller saying they're done
 *   - End node: speaks the farewell and Retell hangs up automatically
 *
 * Run:
 *   cd apps/api && RETELL_API_KEY=key_... RETELL_AGENT_ID=agent_... bun run scripts/fix-agent-endings.ts
 */

import Retell from "retell-sdk"

const retell = new Retell({ apiKey: Bun.env.RETELL_API_KEY ?? "" })

if (!Bun.env.RETELL_API_KEY) {
  console.error("RETELL_API_KEY is not set"); process.exit(1)
}

const NEUVETRA_FLOW_ID = "conversation_flow_66f88e7e0583"

const WRAPUP_DONE_PROMPT =
  "Caller said they have no more requests, said no, said thanks, said bye, or otherwise indicated they are finished — even briefly"

function fixNodes(nodes: any[], endText: string): any[] {
  return nodes.map((node: any) => {

    // End node: speak farewell and hang up (Retell auto-hangs after end node speaks)
    if (node.type === "end") {
      return {
        ...node,
        instruction: { type: "static_text", text: endText },
      }
    }

    // WrapUp node: ONLY ask "anything else?" — no goodbye speech
    // When caller says no, edge fires to End which handles the farewell
    if (node.name === "Wrap Up" || node.name === "Wrap Up ") {
      return {
        ...node,
        instruction: {
          type: "prompt",
          text: `Ask the caller: "Is there anything else I can help you with today?"
Do NOT say goodbye or a closing statement here — just ask the question and wait.
If they say no or indicate they are done, the call will end automatically.
If they have another request, route them to the appropriate flow.`,
        },
        edges: (node.edges ?? []).map((edge: any) => {
          const dest: string = edge.destination_node_id ?? ""
          const isEndEdge = dest.includes("end") || dest.includes("goodbye") ||
            (edge.transition_condition?.prompt ?? "").toLowerCase().includes("hang up") ||
            (edge.transition_condition?.prompt ?? "").toLowerCase().includes("ready to hang")

          return isEndEdge
            ? { ...edge, transition_condition: { type: "prompt", prompt: WRAPUP_DONE_PROMPT } }
            : edge
        }),
      }
    }

    return node
  })
}

// ── Neuvetra agent ────────────────────────────────────────────────────────────

async function fixNeuvetraAgent() {
  console.log("Fetching Neuvetra flow...")
  const flow = await retell.conversationFlow.retrieve(NEUVETRA_FLOW_ID)

  const fixed = (flow.nodes as any[]).map((node: any) => {
    if (node.type === "end") {
      return { ...node, instruction: { type: "static_text", text: "Thanks for calling Neuvetra, have a wonderful day! Goodbye!" } }
    }
    if (node.id === "nv-wrap-up") {
      return {
        ...node,
        instruction: {
          type: "prompt",
          text: `Ask: "Is there anything else I can help you with today?"
Do NOT say goodbye here — just ask and wait. If they are done, the call ends automatically.`,
        },
        edges: (node.edges ?? []).map((edge: any) =>
          edge.destination_node_id === "nv-end"
            ? { ...edge, transition_condition: { type: "prompt", prompt: WRAPUP_DONE_PROMPT } }
            : edge
        ),
      }
    }
    return node
  })

  await retell.conversationFlow.update(NEUVETRA_FLOW_ID, { nodes: fixed })
  console.log("✓ Neuvetra agent fixed")
}

// ── Customer agent ────────────────────────────────────────────────────────────

async function fixCustomerAgent() {
  if (!Bun.env.RETELL_AGENT_ID) {
    console.warn("RETELL_AGENT_ID not set — skipping customer agent"); return
  }
  const agent = await retell.agent.retrieve(Bun.env.RETELL_AGENT_ID)
  const flowId = (agent.response_engine as any)?.conversation_flow_id
  if (!flowId) { console.warn("No flow ID found on customer agent"); return }

  console.log(`Fetching customer flow ${flowId}...`)
  const flow = await retell.conversationFlow.retrieve(flowId)

  const fixed = fixNodes(
    flow.nodes as any[],
    "Thank you for calling, have a wonderful day! Goodbye!"
  )

  await retell.conversationFlow.update(flowId, { nodes: fixed })
  console.log("✓ Customer agent fixed")
}

await fixNeuvetraAgent()
await fixCustomerAgent()
console.log("\nDone — agents now say goodbye in the End node and hang up immediately.")
