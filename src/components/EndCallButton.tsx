import useStreamCall from "@/hooks/useStreamCall";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

const EndCallButton = () => {
  const call = useStreamCall();

  const { useLocalParticipant } = useCallStateHooks();

  const localParticipant = useLocalParticipant();

  const admin =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!admin) return null;

  return (
    <button
      onClick={() => call.endCall()}
      className="mx-auto block font-medium text-red-500 hover:underline"
    >
      End Call For Everyone
    </button>
  );
};

export default EndCallButton;
