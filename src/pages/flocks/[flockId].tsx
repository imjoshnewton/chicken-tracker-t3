import Image from "next/image";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Breeds from "../../components/Breeds";
import Stats from "../../components/Stats";
import { useFlockData } from "../../libs/hooks";

export default function Flocks() {
    const { flockId, flock, loading } = useFlockData();

    console.log("Flock Id: ", flockId);

    return (
        <main>
            {
                flock ? (
                    <Card title="Flock Details" key={flockId?.toString()}>
                        <div className="flex items-center">
                            <Image src={flock?.imageUrl} width="150" height="150" className="flock-image" alt="" />
                            <div className="ms-4">
                                <h2>{flock?.name}</h2>
                                <p className="description">{flock?.description}</p>
                                <p>{flock?.type}</p>
                            </div>
                        </div>
                        <div className="divider my-4"></div>
                        <div className="flex flex-wrap justify-evently">
                            <Breeds breeds={flock?.breeds} className="flex-50"></Breeds>
                            <Stats logs={flock.logs} flock={flock} className="flex-50"></Stats>
                        </div>
                    </Card>
                ) : (
                    <div className="flex justify-center">
                        <Loader show={true}></Loader>
                    </div>
                )
            }
        </main>
    )
}