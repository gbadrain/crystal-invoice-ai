export function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-white/60">Welcome to Crystal Invoice AI</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider">
            Total Invoices
          </p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider">
            Pending
          </p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider">
            Revenue
          </p>
          <p className="text-3xl font-bold mt-2">$0.00</p>
        </div>
      </div>
    </div>
  )
}
