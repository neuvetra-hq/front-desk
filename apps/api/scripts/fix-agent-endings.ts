#!/usr/bin/env bun
/**
 * Fix hang-up behavior for both the customer agent and Neuvetra agent.
 *
 * Problem: WrapUp node waits for caller to hang up instead of ending the call.
 * Fix:
 *   - WrapUp → End edge: looser condition that fires when caller is done
 *   - End nodes: clear goodbye instruction so Retell speaks and hangs up
 *
 * Run:
 *   cd apps/api && RETELL_API_KEY=key_... bun run scripts/fix-agent-endings.ts
 */

import Retell from "retell-sdk"

const retell = new Retell({ apiKey: Bun.env.RETELL_API_KEY ?? "" })

if (!Bun.env.RETELL_API_KEY) {
  console.error("RETELL_API_KEY is not set")
  process.exit(1)
}

const NEUVETRA_FLOW_ID = "conversation_flow_66f88e7e0583"

// ── Helper ──────────────────────────────────────────────────────────────────

function fixWrapUpEdge(nodes: any[]): any[] {
  return nodes.map((node: any) => {
    if (node.name !== "Wrap Up" && node.name !== "Wrap Up ") return node

    const edges = (node.edges ?? []).map((edge: any) => {
      // Tighten the goodbye edge — fire as soon as caller is done
      const isGoodbyeEdge =
        edge.destination_node_id?.includes("end") ||
        edge.destination_node_id?.includes("goodbye") ||
        (edge.transition_condition?.prompt ?? "").toLowerCase().includes("hang up") ||
        (edge.transition_condition?.prompt ?? "").toLowerCase().includes("ready to hang")

      if (isGoodbyeEdge) {
        return {
          ...edge,
          transition_condition: {
            type: "prompt",
            prompt: "Caller said they have no more requests, said thanks, said goodbye, or expressed they are done — even if they haven't explicitly said 'hang up'",
          },
        }
      }
      return edge
    })

    return { ...node, edges }
  })
}

function fixEndNodes(nodes: any[]): any[] {
  return nodes.map((node: any) => {
    if (node.type !== "end") return node
    return {
      ...node,
      instruction: {
        type: "static_text",
        text: "Thank you for calling, have a wonderful day! Goodbye!",
      },
    }
  })
}

// ── Neuvetra agent ───────────────────────────────────────────────────────────

async function fixNeuvetraAgent() {
  console.log("Fetching Neuvetra flow...")
  const flow = await retell.conversationFlow.retrieve(NEUVETRA_FLOW_ID)
  const nodes = flow.nodes ?? []

  // Fix WrapUp edge + End node instruction
  const updated = fixEndNodes(fixWrapUpEdge(nodes as any[]))

  // Also fix Neuvetra's WrapUp node which uses "nv-end" as destination
  const neuvetraFixed = updated.map((node: any) => {
    if (node.id !== "nv-wrap-up") return node
    return {
      ...node,
      edges: (node.edges ?? []).map((edge: any) =>
        edge.destination_node_id === "nv-end"
          ? {
              ...edge,
              transition_condition: {
                type: "prompt",
                prompt: "Caller said they have no more requests, said thanks, said goodbye, or expressed they are done",
              },
            }
          : edge
      ),
    }
  })

  // Neuvetra end node: use static goodbye text
  const neuvetraFinal = neuvetraFixed.map((node: any) => {
    if (node.id !== "nv-end") return node
    return {
      ...node,
      instruction: {
        type: "static_text",
        text: "Thanks for calling Neuvetra, have a wonderful day! Goodbye!",
      },
    }
  })

  await retell.conversationFlow.update(NEUVETRA_FLOW_ID, { nodes: neuvetraFinal as any })
  console.log("✓ Neuvetra agent fixed")
}

// ── Customer agent ───────────────────────────────────────────────────────────

async function fixCustomerAgent() {
  if (!Bun.env.RETELL_AGENT_ID) {
    console.warn("RETELL_AGENT_ID not set — skipping customer agent fix")
    return
  }

  console.log("Fetching customer agent...")
  const agent = await retell.agent.retrieve(Bun.env.RETELL_AGENT_ID)
  const engine = agent.response_engine as any
  const flowId = engine?.conversation_flow_id
  if (!flowId) {
    console.warn("Could not find conversation_flow_id on customer agent")
    return
  }

  console.log(`Fetching customer flow ${flowId}...`)
  const flow = await retell.conversationFlow.retrieve(flowId)
  const nodes = flow.nodes ?? []

  const updated = fixEndNodes(fixWrapUpEdge(nodes as any[]))

  await retell.conversationFlow.update(flowId, { nodes: updated as any })
  console.log("✓ Customer agent fixed")
}

// ── Run ──────────────────────────────────────────────────────────────────────

await fixNeuvetraAgent()
await fixCustomerAgent()

console.log("")
console.log("Done — both agents will now hang up after caller says goodbye.")
