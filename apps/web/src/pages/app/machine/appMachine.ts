import { setup, assign } from "xstate"
import type { Session } from "@supabase/supabase-js"
import {
  checkWebGL,
  getSession,
  loadProfile,
  supabaseAuthListener,
} from "./appMachine.actors"
import type { AppContext, AppEvent, AppUserProfile, AppBusiness } from "./appMachine.types"

export const appMachine = setup({
  types: {} as {
    context: AppContext
    events: AppEvent
  },
  actors: {
    checkWebGL,
    getSession,
    loadProfile,
    supabaseAuthListener,
  },
  actions: {
    setSessionFromAuth: assign(({ event }) => ({
      session: (event as Extract<AppEvent, { type: "AUTH_STATE_CHANGED" }>).session,
    })),
    clearAuth: assign({
      session: null as Session | null,
      profile: null as AppUserProfile | null,
      business: null as AppBusiness | null,
    }),
    setRoute: assign(({ event }) => ({
      currentRoute: (event as Extract<AppEvent, { type: "ROUTE_CHANGED" }>).pathname,
    })),
  },
}).createMachine({
  id: "neuvetraAI",
  type: "parallel",
  invoke: {
    src: "supabaseAuthListener",
    id: "authListener",
  },
  context: {
    session: null,
    profile: null,
    business: null,
    currentRoute: "/app",
  },
  states: {
    // ── WebGL gate ──────────────────────────────────────────────
    webgl: {
      initial: "checking",
      states: {
        checking: {
          invoke: {
            src: "checkWebGL",
            onDone: [
              { guard: ({ event }) => event.output === true, target: "supported" },
              { target: "unsupported" },
            ],
          },
        },
        supported: { type: "final" },
        unsupported: { type: "final" },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────
    auth: {
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "getSession",
            onDone: [
              {
                guard: ({ event }) => event.output !== null,
                target: "authenticated",
                actions: assign(({ event }) => ({ session: event.output })),
              },
              { target: "unauthenticated" },
            ],
          },
          on: {
            AUTH_STATE_CHANGED: {
              guard: ({ event }) => event.session !== null,
              target: "authenticated",
              actions: "setSessionFromAuth",
            },
          },
        },
        unauthenticated: {
          on: {
            AUTH_STATE_CHANGED: {
              guard: ({ event }) => event.session !== null,
              target: "authenticated",
              actions: "setSessionFromAuth",
            },
          },
        },
        authenticated: {
          initial: "loadingProfile",
          on: {
            AUTH_STATE_CHANGED: [
              {
                guard: ({ event }) => event.session !== null,
                actions: "setSessionFromAuth",
              },
              {
                target: "#neuvetraAI.auth.unauthenticated",
                actions: "clearAuth",
              },
            ],
            SIGN_OUT: {
              target: "#neuvetraAI.auth.unauthenticated",
              actions: "clearAuth",
            },
          },
          states: {
            loadingProfile: {
              invoke: {
                src: "loadProfile",
                input: ({ context }) => ({ userId: context.session!.user.id }),
                onDone: [
                  {
                    guard: ({ event }) => event.output.business?.status === "active",
                    target: "ready",
                    actions: assign(({ event }) => ({
                      profile: event.output.profile,
                      business: event.output.business,
                    })),
                  },
                  {
                    target: "incomplete",
                    actions: assign(({ event }) => ({
                      profile: event.output.profile,
                      business: event.output.business,
                    })),
                  },
                ],
              },
            },
            incomplete: {},
            ready: {},
          },
        },
      },
    },

    // ── Audio ─────────────────────────────────────────────────────
    audio: {
      initial: "dormant",
      states: {
        dormant: {
          on: { USER_INTERACTED: "active" },
        },
        active: {
          initial: "unmuted",
          states: {
            unmuted: { on: { TOGGLE_MUTE: "muted" } },
            muted: { on: { TOGGLE_MUTE: "unmuted" } },
          },
        },
      },
    },

    // ── View ─────────────────────────────────────────────────────
    // Starts in 'loading' — stays there until SPIRIT_READY fires.
    // ROUTE_CHANGED in 'loading' only stores the pathname; it does not
    // transition view state. On SPIRIT_READY, jumps to the page that
    // matches context.currentRoute. After that, ROUTE_CHANGED at the
    // parent level handles all page-to-page navigation normally.
    view: {
      initial: "loading",
      on: {
        ROUTE_CHANGED: [
          {
            guard: ({ event }) => event.pathname === "/app",
            target: ".home",
            actions: "setRoute",
          },
          {
            guard: ({ event }) => event.pathname === "/app/how-it-works",
            target: ".howItWorks",
            actions: "setRoute",
          },
          {
            guard: ({ event }) => event.pathname === "/app/pricing",
            target: ".pricing",
            actions: "setRoute",
          },
          {
            guard: ({ event }) => event.pathname === "/app/sign-in",
            target: ".signIn",
            actions: "setRoute",
          },
          {
            guard: ({ event }) => event.pathname === "/app/get-started",
            target: ".getStarted",
            actions: "setRoute",
          },
        ],
      },
      states: {
        loading: {
          on: {
            // Shadow the parent ROUTE_CHANGED: store route only, no view transition
            ROUTE_CHANGED: { actions: "setRoute" },
            // On engine ready, jump to the page that matches the stored route
            SPIRIT_READY: [
              {
                guard: ({ context }) => context.currentRoute === "/app",
                target: "home",
              },
              {
                guard: ({ context }) => context.currentRoute === "/app/how-it-works",
                target: "howItWorks",
              },
              {
                guard: ({ context }) => context.currentRoute === "/app/pricing",
                target: "pricing",
              },
              {
                guard: ({ context }) => context.currentRoute === "/app/sign-in",
                target: "signIn",
              },
              {
                guard: ({ context }) => context.currentRoute === "/app/get-started",
                target: "getStarted",
              },
              // Fallback: any unknown /app/* path lands on home
              { target: "home" },
            ],
          },
        },
        home: {},
        howItWorks: {},
        pricing: {},
        signIn: {},
        getStarted: {},
      },
    },
  },
})

export type AppMachineSnapshot = ReturnType<typeof appMachine.transition>
