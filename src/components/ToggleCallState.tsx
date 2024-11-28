import useStreamCall from "@/hooks/useStreamCall";
import {
  CallControls,
  PaginatedGridLayout,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import {
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import EndCallButton from "./EndCallButton";
import { useRouter } from "next/navigation";

type ToggleState = "vertical" | "horizontal" | "grid";

const ToggleCallState = () => {
  const [layout, setLayout] = useState<ToggleState>("vertical");

  const call = useStreamCall();

  const router = useRouter();

  return (
    <div className="space-y-3">
      <CallViewButtons layout={layout} setLayout={setLayout} />
      <CallViewState layout={layout} />
      <CallControls onLeave={() => router.push(` /meeting/${call.id}/left`)} />
      <EndCallButton />
    </div>
  );
};

export default ToggleCallState;

interface CallViewStateProps {
  layout: ToggleState;
}

interface CallViewButtonsProps {
  layout: ToggleState;
  setLayout: (layout: ToggleState) => void;
}

function CallViewButtons({ layout, setLayout }: CallViewButtonsProps) {
  return (
    <div className="mx-auto w-fit space-x-6">
      <button onClick={() => setLayout("vertical")}>
        <BetweenVerticalEnd
          className={layout !== "vertical" ? "text-gray-400" : ""}
        />
      </button>

      <button onClick={() => setLayout("horizontal")}>
        <BetweenHorizontalEnd
          className={layout !== "horizontal" ? "text-gray-400" : ""}
        />
      </button>

      <button onClick={() => setLayout("grid")}>
        <LayoutGrid className={layout !== "grid" ? "text-gray-400" : ""} />
      </button>
    </div>
  );
}

function CallViewState({ layout }: CallViewStateProps) {
  if (layout == "vertical") {
    return <SpeakerLayout />;
  }

  if (layout == "horizontal") {
    return <SpeakerLayout participantsBarPosition="right" />;
  }

  if (layout == "grid") {
    return <PaginatedGridLayout />;
  }

  return null;
}
