import { Container } from "@/components/layout/Container"
import { HOW_IT_WORKS } from "@/constants/landing"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gradient-to-br from-indigo-50 to-white py-24">
      <Container>
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            How it works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-neutral-500">No technical expertise required. No IT team needed.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                i === 0
                  ? "bg-indigo-600 text-white"
                  : "border-2 border-indigo-200 bg-white text-indigo-600"
              }`}>
                {item.step}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-xs leading-relaxed text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
