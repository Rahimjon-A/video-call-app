import { useCall } from "@stream-io/video-react-sdk";

export default function useStreamCall() {
  const call = useCall();

  if (!call) {
    throw new Error(
      " useSreamCall must be used within a Streamcall component with valid call prop.",
    );
  }

  return call;
}
