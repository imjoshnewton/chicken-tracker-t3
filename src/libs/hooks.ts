import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';

export interface BaseUser {
    id: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
}

// Custom hook to read  auth record and user profile doc
export function useUserData() {
    const { data, status } = useSession({
        required: true
    });

    return { user: data?.user, defaultFlock: data?.defaultFlock, status };
}

// Custom hook to read  auth record and user profile doc
export function useFlockData() {
    const router = useRouter();
    const { flockId, statsRange } = router.query;
    const range = statsRange ? Number(statsRange) : 7;

    const flockData = trpc.useQuery(["flocks.getFlock", { flockId: flockId?.toString() }], {
        enabled: !!flockId
    });
    const logsData = trpc.useQuery(["flocks.getStatLogs", { flockId: flockId?.toString(), limit: range }], {
        enabled: !!flockId
    });

    return { flockId, flock: flockData.data, logs: logsData.data, range, loading: !flockData.data };
}

// export function useFlockData() {
//     const router = useRouter();
//     const { flockId } = router.query;

//     const [flock, setFlock] = useState(null);

//     useEffect(() => {
//         let unsubFlock;

//         if (flockId) {
//             const flockDoc = doc(firestore, `flocks/${flockId}`);

//             unsubFlock = onSnapshot(flockDoc, (doc) => {
//                 setFlock(doc.data());
//             });
//         }
//         else {
//             setFlock(null);
//         }

//         return unsubFlock;
//     }, [flockId])

//     return { flockId, flock };
// }

// export function useLogsData() {
//     const router = useRouter();
//     const { flockId } = router.query;

//     const [logs, setLogs] = useState(null);

//     useEffect(() => {
//         let unsubLogs;

//         if (flockId) {
//             const logCol = collection(firestore, 'logs');
//             const q = query(logCol, where('flock', '==', flockId), orderBy('date', 'desc'), limit(7));

//             unsubLogs = onSnapshot(q, (docs) => {
//                 setLogs(docs.docs.map(doc => doc.data()));
//             })
//         }
//         else {
//             setLogs(null);
//         }

//         return unsubLogs;
//     }, [flockId])

//     return { logs };
// }