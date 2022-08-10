import { Breed, Flock, Log } from '@prisma/client';
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Link from 'next/link';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Stats({ logs, flock, className }: { logs: Log[], flock: Flock & { breeds: Breed[], logs: Log[] }, className: string }) {
    function chartData(logs: Log[], flock: Flock & { breeds: Breed[], logs: Log[] }) {
        const flockDailyAverage = calcDailyAverage(flock);
        const sorted = logs.sort((a, b) => {
            return a.date > b.date ? 1 : -1
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
            labels: sorted.map((i: any) => i.date.toLocaleString('us-EN', { year: 'numeric', month: 'numeric', day: 'numeric' }))
        }
    }

    function calcDailyAverage(flock: Flock & { breeds: Breed[], logs: Log[]}): number {
        const breedAverages = flock.breeds.map(breed => (breed.averageProduction * breed.count) / 7);
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
            <h2>Stats</h2>
            <div className="flex flex-col">
                <Line data={chartData(logs, flock)} options={options} id="flockchart"></Line>
                <div className='p-2'></div>
                <Link href="/logs" className=''>See all logs &gt;</Link>
            </div>
        </div>
    );
}