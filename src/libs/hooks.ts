import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { Breed, Flock, Log } from '@prisma/client';
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
    const [ defaultFlock, setDefaultFlock ] = useState<string | null>(null);
    const userResp = trpc.useQuery(["user.getUser", { userId: data?.user?.id }]);

    console.log("Data: ", data);
    
    useEffect(() => {
        if (data?.user) {
            setDefaultFlock(userResp.data ? userResp.data.defaultFlock : null);
            
        } else {
            setDefaultFlock(null);
        }
    }, [data?.user]);

    return { user: data?.user, defaultFlock: data?.defaultFlock };
}

// Custom hook to read  auth record and user profile doc
export function useFlockData() {
    const router = useRouter();
    const { flockId } = router.query;
    const flockData = trpc.useQuery(["flocks.getFlock", { flockId: flockId?.toString() }]);

    console.log("FLock Data: ", flockData.data);

    // useEffect(() => {
    //     if (data?.user && flockId) {
    //         setFlock(flockData.data ? flockData.data : null);

    //     } else {
    //         setFlock(null);
    //     }
    // }, [flockId]);

    return { flockId, flock: flockData.data, loading: !flockData.data };
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