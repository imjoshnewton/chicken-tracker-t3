import { DocumentData, Timestamp } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Stats({ logs, flock, className }) {
    function chartData(logs: DocumentData[], flock?: any) {
        const flockDailyAverage = calcDailyAverage(flock);
        const sorted = logs.sort((a, b) => {
            return (a['date'] as Timestamp).toMillis() > (b['date'] as Timestamp).toMillis() ? 1 : -1
        })
        return {
            datasets: [
                {
                    data: sorted.map((i: any) => i.count),
                    label: 'Egg Production',
                    backgroundColor: 'rgba(39,166,154,0.2)',
                    borderColor: 'rgba(39,166,154,1)',
                    pointBackgroundColor: 'rgba(148,159,177,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)',
                    fill: 'origin',
                },
                {
                    data: sorted.map((i: any) => flockDailyAverage),
                    label: 'Flock Average',
                    backgroundColor: 'rgba(149,159,177,0.2)',
                    borderColor: 'rgba(149,159,177,1)',
                    pointBackgroundColor: 'rgba(148,159,177,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(148,159,177,0.8)',
                    fill: 'origin',
                }
            ],
            labels: sorted.map((i: any) => (i.date as Timestamp).toDate().toLocaleString('us-EN', { year: 'numeric', month: 'numeric', day: 'numeric' }))
        }
    }

    function calcDailyAverage(flock: any) {
        const breedAverages = flock?.chickens.map(breed => (breed.averageProduction * breed.count) / 7);
        const dailyAverage = breedAverages.reduce((a, b) => a + b);

        return dailyAverage;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
                text: 'Chart.js Line Chart',
            },
        },
    };

    if(!flock || !logs) {
        return null;
    }

    return (
        <div className={className}>
            <h3>Stats</h3>
            <div className="d-flex flex-wrap">
                <Line data={chartData(logs, flock)} options={options} id="flockchart"></Line>
                {/* {
                    logs.map((log, index) => {
                        return (
                            <>
                                <pre>{log.count}</pre>
                                <pre>{log.notes}</pre>
                            </>
                        )
                    })
                } */}
            </div>
        </div>
    );
}