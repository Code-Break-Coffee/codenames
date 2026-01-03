import { useAudio } from '../context/AudioContext.jsx';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AudioControl = () => {
  const { isMuted, setIsMuted } = useAudio();

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="p-2 rounded bg-gray-200 dark:bg-gray-700 absolute right-[60px] top-[10px] hover:cursor-pointer z-[10]"
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
    </button>
  );
};

export default AudioControl;
