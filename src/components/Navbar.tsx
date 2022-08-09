import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useUserData } from '../libs/hooks';
import { trpc } from '../utils/trpc';

// Top navbar
export default function Navbar() {
    const { user, defaultFlock } = useUserData();
    // const { data, status } = useSession();
    // const user = data?.user;

    // const userResp = trpc.useQuery(["user.getUser", { userId: user?.id }]);

    // const defaultFlock = userResp.data ? userResp.data.defaultFlock : null;

    console.log("Navbar user: ", user);
    console.log("Navbar defaultFlock: ", defaultFlock);
    

    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link href="/">
                        {/* <button className="btn-logo">Home</button> */}
                        <span className='flex items-center'><Image src="/chicken.svg" width='50' height='50' alt="Chicken tracker logo" />Chicken Tracker</span>
                    </Link>
                </li>

                {/* user is signed-in */}
                {user && (
                    <>
                        {/* <li className="push-left">
                            <Link href="/flocks">
                                <button className="btn-blue">Flocks</button>
                            </Link>
                        </li> */}
                        <li className='ml-auto'>
                            <div className='mr-3 user-name'>{user.name}</div>
                        </li>
                        <li>
                            <Link href={`/flocks/${defaultFlock}`}>
                                <img src={user.image as string} width="50" height="50" alt="" className='profile-image' />
                            </Link>
                        </li>
                    </>
                )}

                {/* user is not signed-in */}
                {!user && (
                    <li>
                        <Link href="/api/auth/signin">
                            <button className="btn-blue">Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}