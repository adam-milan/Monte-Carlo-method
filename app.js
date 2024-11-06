const { useState } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

function App() {
    const [inputs, setInputs] = useState({
        initialInvestment: 100000,
        monthlyContribution: 5000,
        years: 33,
        simulations: 1000
    });

    const [results, setResults] = useState(null);

    function runSimulation() {
        const { initialInvestment, monthlyContribution, years, simulations } = inputs;
        const months = years * 12;
        const meanReturn = 0.1 / 12; // 月化報酬率
        const stdDev = 0.15 / Math.sqrt(12); // 月化標準差

        const results = new Array(simulations).fill(0).map(() => {
            let portfolio = initialInvestment;
            for (let month = 0; month < months; month++) {
                const u1 = Math.random();
                const u2 = Math.random();
                const randomReturn = 
                    Math.sqrt(-2.0 * Math.log(u1)) * 
                    Math.cos(2.0 * Math.PI * u2) * 
                    stdDev + meanReturn;
                
                portfolio = portfolio * (1 + randomReturn) + monthlyContribution;
            }
            return portfolio;
        });

        results.sort((a, b) => a - b);
        const stats = {
            min: results[Math.floor(0.05 * results.length)],
            median: results[Math.floor(0.5 * results.length)],
            max: results[Math.floor(0.95 * results.length)]
        };

        // 準備圖表數據
        const buckets = 20;
        const min = Math.min(...results);
        const max = Math.max(...results);
        const bucketSize = (max - min) / buckets;
        
        const histogram = new Array(buckets).fill(0).map((_, i) => {
            const bucketMin = min + i * bucketSize;
            const bucketMax = min + (i + 1) * bucketSize;
            const count = results.filter(v => v >= bucketMin && v < bucketMax).length;
            return {
                range: `${(bucketMin/1000000).toFixed(1)}M-${(bucketMax/1000000).toFixed(1)}M`,
                count,
            };
        });

        setResults({ stats, histogram });
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-8">蒙地卡羅投資模擬器</h1>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">初始投資金額</label>
                        <input 
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={inputs.initialInvestment}
                            onChange={e => setInputs(prev => ({
                                ...prev,
                                initialInvestment: parseFloat(e.target.value)
                            }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">每月投入金額</label>
                        <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={inputs.monthlyContribution}
                            onChange={e => setInputs(prev => ({
                                ...prev,
                                monthlyContribution: parseFloat(e.target.value)
                            }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">投資年限</label>
                        <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={inputs.years}
                            onChange={e => setInputs(prev => ({
                                ...prev,
                                years: parseFloat(e.target.value)
                            }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">模擬次數</label>
                        <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={inputs.simulations}
                            onChange={e => setInputs(prev => ({
                                ...prev,
                                simulations: parseInt(e.target.value)
                            }))}
                        />
                    </div>
                </div>
                <button 
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={runSimulation}
                >
                    執行模擬
                </button>
            </div>

            {results && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-500">保守估計 (5%)</div>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('zh-TW', { 
                                    style: 'currency', 
                                    currency: 'TWD',
                                    maximumFractionDigits: 0 
                                }).format(results.stats.min)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-500">中位數</div>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('zh-TW', { 
                                    style: 'currency', 
                                    currency: 'TWD',
                                    maximumFractionDigits: 0 
                                }).format(results.stats.median)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-500">樂觀估計 (95%)</div>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('zh-TW', { 
                                    style: 'currency', 
                                    currency: 'TWD',
                                    maximumFractionDigits: 0 
                                }).format(results.stats.max)}
                            </div>
                        </div>
                    </div>

                    <BarChart width={800} height={300} data={results.histogram}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="range" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4f46e5" />
                    </BarChart>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
