import ConnectButton from './ConnectButton';
import DisconnectButton from './DisconnectButton';
import { useSelector } from 'react-redux';
import { selectBeaconConnection } from '../features/tezos/selectors';
const Navbar = () => {

    const beaconConnection = useSelector(selectBeaconConnection);
    return (
        <nav className={`flex items-center ${beaconConnection ? "justify-between" : "justify-end"} flex-wrap bg-gray-900 p-6 border-gray-200 `}>
            {
                beaconConnection ?
                    <div className='w-full flex flex-row justify-between'>
                        <DisconnectButton />
                    </div>
                    :
                    <ConnectButton />
            }
        </nav>
    )
}

export default Navbar;