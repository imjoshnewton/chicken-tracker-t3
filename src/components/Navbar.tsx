import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../libs/context';

// Top navbar
export default function Navbar() {
    const { user, defaultFlock } = useContext(UserContext)

    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link href="/">
                        {/* <button className="btn-logo">Home</button> */}
                        <span className='d-flex align-items-center'><Image src="/chicken.svg" width='50' height='50' alt="Chicken tracker logo" />Chicken Tracker</span>
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
                        <li className='push-left'>
                            <div className='me-3 user-name'>{user?.displayName}</div>
                        </li>
                        <li>
                            <Link href={`/flocks/${defaultFlock}`}>
                                <img src={user?.photoURL} width="50" height="50" alt="" className='profile-image' />
                            </Link>
                        </li>
                    </>
                )}

                {/* user is not signed-in */}
                {!user && (
                    <li>
                        <Link href="/login">
                            <button className="btn-blue">Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}