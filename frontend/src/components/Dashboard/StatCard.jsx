export default function StatCard({ title, value, icon, color, trend, trendGraph }) {
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' }
    }

    const icons = {
        train: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
        ),
        schedule: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        track: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
        chart: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }

    const theme = colors[color] || colors.blue

    return (
        <div className="card-new hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} ring-4 ${theme.ring}`}>
                    {icons[icon]}
                </div>
                {trend && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">{title}</p>
            </div>

            {trendGraph && (
                <div className="mt-4 h-8 flex items-end gap-1">
                    <div className="w-full bg-blue-50 h-2 rounded-t-sm"></div>
                    <div className="w-full bg-blue-100 h-4 rounded-t-sm"></div>
                    <div className="w-full bg-blue-200 h-3 rounded-t-sm"></div>
                    <div className="w-full bg-blue-300 h-5 rounded-t-sm"></div>
                    <div className="w-full bg-blue-500 h-8 rounded-t-sm"></div>
                </div>
            )}
        </div>
    )
}
