import { Check, Minus } from 'lucide-react'

const rows = [
  { feature: 'AI invoice generation',  free: true,  pro: true  },
  { feature: 'Voice input',            free: true,  pro: true  },
  { feature: 'PDF export',             free: true,  pro: true  },
  { feature: 'Email invoice to client',free: true,  pro: true  },
  { feature: 'Status tracking',        free: true,  pro: true  },
  { feature: 'Trash & restore',        free: true,  pro: true  },
  { feature: 'Company logo on PDF',    free: true,  pro: true  },
  { feature: 'Unlimited invoices',     free: false, pro: true  },
  { feature: 'Priority support',       free: false, pro: true  },
  { feature: 'Custom branding',        free: false, pro: true  },
]

function Cell({ active }: { active: boolean }) {
  return active ? (
    <td className="py-4 text-center">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-crystal-600/20">
        <Check className="w-3.5 h-3.5 text-crystal-400" aria-label="Included" />
      </span>
    </td>
  ) : (
    <td className="py-4 text-center">
      <span className="inline-flex items-center justify-center">
        <Minus className="w-4 h-4 text-white/20" aria-label="Not included" />
      </span>
    </td>
  )
}

export function PricingTableSection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-white/40 text-sm mb-6">Full feature comparison</p>

        <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
          <table className="w-full" aria-label="Plan comparison table">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="py-4 px-6 text-left text-xs text-white/40 font-medium uppercase tracking-wider">
                  Feature
                </th>
                <th className="py-4 px-4 text-center text-xs text-white/40 font-medium uppercase tracking-wider w-24">
                  Free
                </th>
                <th className="py-4 px-4 text-center text-xs font-semibold uppercase tracking-wider w-24 text-crystal-400">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                >
                  <td className="py-4 px-6 text-sm text-white/70">{row.feature}</td>
                  <Cell active={row.free} />
                  <Cell active={row.pro} />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/[0.02]">
                <td className="py-5 px-6 text-sm font-semibold text-white/80">Price</td>
                <td className="py-5 px-4 text-center text-sm font-bold text-white/60">
                  $0<span className="text-xs font-normal text-white/30">/forever</span>
                </td>
                <td className="py-5 px-4 text-center text-sm font-bold text-crystal-300">
                  $9<span className="text-xs font-normal text-crystal-400/60">/month</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  )
}
