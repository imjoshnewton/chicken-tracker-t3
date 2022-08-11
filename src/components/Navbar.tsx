import Image from 'next/image';
import Link from 'next/link';
import { useUserData } from '../libs/hooks';

// Top navbar
export default function Navbar() {
    const { user, defaultFlock } = useUserData();

    return (
        <nav className="navbar">
            <ul>
                <li className='cursor-pointer'>
                    <Link href="/">
                        <span className='flex items-center'>Chicken&nbsp;<Image src="/chicken.svg" width='42' height='42' alt="Chicken tracker logo" />&nbsp;Tracker</span>
                    </Link>
                </li>

                {/* user is signed-in */}
                {user && (
                    <>
                        <li className='ml-auto text-white hover:text-slate-200'>
                            <div className='h-10 w-[1.5px] bg-white'></div>
                        </li>
                        <li className='ml-4 flex items-center multilink cursor-pointer'>
                            <div className='mr-3 user-name'>{user.name}</div>
                            {/* <Link href={`/flocks/${defaultFlock}`}> */}
                                <img src={user.image as string} width="50" height="50" alt="" className='profile-image' />
                            {/* </Link> */}
                            <div className="multilink-content fadeIn">
                                <Link href={`/flocks/${defaultFlock}`}>
                                    My Flock
                                </Link>
                                <Link href={`/logs`}>
                                    All Logs
                                </Link>
                                <Link href="/api/auth/signout">Logout</Link>
                            </div>
                        </li>
                    </>
                )}

                {/* user is not signed-in */}
                {!user && (
                    <li>
                        <Link href="/api/auth/signin">
                            <button className="btn">Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}