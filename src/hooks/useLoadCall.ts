import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
const useLoadCall = (id: string) => {
  const client = useStreamVideoClient();

  const [call, setCall] = useState<Call>();
  const [loadingCall, setLoadingCall] = useState(true);

  useEffect(() => {
    async function loadCall() {
      setLoadingCall(true);

      if (!client) return;

      const { calls } = await client.queryCalls({
        filter_conditions: { id },
      });

      if (calls.length > 0) {
        const call = calls[0];

        await call.get();

        setCall(call);
      }
      setLoadingCall(false);
    }
    loadCall();
  }, [client, id]);

  return { call, loadingCall };
};

export default useLoadCall;
