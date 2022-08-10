import ConnectButton from './ConnectButton';
import DisconnectButton from './DisconnectButton';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { selectBeaconConnection } from '../features/tezos/selectors';
const Navbar = () => {
    const history = useHistory();
    const beaconConnection = useSelector(selectBeaconConnection);
    return (
        <nav className={`flex justify-between bg-gray-800 p-6 font-Rampart`}>
            <div className='w-12 h-12'>
                <img src="./images/energize.png"></img>
            </div>
            <div className='flex '>
                <button className='p-2 text-indigo-50' onClick={() => history.push('/mint')}> Mint  |  </button> 
                <button className='p-2 text-indigo-50' onClick={() => history.push('/marketplace')}> Marketplace </button> 
            </div>
            <div className='flex'>
            {
                beaconConnection ?
                    <DisconnectButton />
                    :
                    <ConnectButton />
            }
            </div>
        </nav>
    )
}

export default Navbar;