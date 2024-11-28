"use client";

import AudioVolumeIndicator from "@/components/AudioVolumeIndicator";
import Button, { buttonClassName } from "@/components/Button";
import PermissionPrompt from "@/components/PermissitonPrompt";
import RecordingsList from "@/components/RecordingsList";
import ToggleCallState from "@/components/ToggleCallState";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  CallControls,
  CallingState,
  DeviceSettings,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useStreamVideoClient,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MeetingPageProps {
  id: string;
}

export default function MeetingPage({ id }: MeetingPageProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { call, loadingCall } = useLoadCall(id);

  if (!userLoaded || loadingCall) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!call) {
    return (
      <p className="text-center font-medium text-red-400">Here is no meeting</p>
    );
  }

  const notAllowedToJoin =
    call.type === "private-meeting" &&
    (!user || !call.state.members.find((m) => m.user.id == user.id));

  if (notAllowedToJoin) {
    return (
      <p className="text-center font-medium text-red-400">
        You are not allowed to join. It is a private meeting
      </p>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <MeetingScreen />
      </StreamTheme>
    </StreamCall>
  );
}

function MeetingScreen() {
  const call = useStreamCall();
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();

  const callEndedAt = useCallEndedAt();
  const callStartsAt = useCallStartsAt();

  const [setup, setSetup] = useState(false);

  const handleSetupComplete = () => {
    call.join();
    setSetup(true);
  };

  const callIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();

  const callHasEnded = !!callEndedAt;

  if (callHasEnded) {
    return <MeetingEndedScreen />;
  }

  if (callIsInFuture) {
    return <UpcomingMeetingScreen />;
  }

  const description = call.state.custom.description;

  return (
    <div className="space-y-3">
      {description && (
        <p className="text-center">
          Meeting Description: <span className="font-bold">{description}</span>{" "}
        </p>
      )}
      {setup ? <CallUI /> : <SetupUi onSetupComplete={handleSetupComplete} />}
    </div>
  );
}

interface SetupUiProps {
  onSetupComplete: () => void;
}

function SetupUi({ onSetupComplete }: SetupUiProps) {
  const call = useStreamCall();

  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const micState = useMicrophoneState();
  const camState = useCameraState();

  const [micCamDisabled, setMicCamDisabled] = useState(false);

  useEffect(() => {
    if (micCamDisabled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [micCamDisabled, call]);

  if (!micState.hasBrowserPermission || !camState.hasBrowserPermission) {
    return <PermissionPrompt />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center gap-3">
        <AudioVolumeIndicator />
        <DeviceSettings />
      </div>
      <label className="flex items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={micCamDisabled}
          onChange={(e) => setMicCamDisabled(e.target.checked)}
        />
        Join with mic and camera off
      </label>
      <Button onClick={onSetupComplete}>Join meeting</Button>
    </div>
  );
}

function CallUI() {
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED)
    return <Loader2 className="mx-auto animate-spin" />;

  return <ToggleCallState />;
}

function UpcomingMeetingScreen() {
  const call = useStreamCall();

  return (
    <div className="flex flex-col items-center gap-6">
      <p>
        The Meeting has not started yet! It will start at{" "}
        <span className="font-bold">
          {call.state.startsAt?.toLocaleString()}
        </span>
      </p>
      {call.state.custom.description && (
        <p>
          Description:
          <span className="font-bold"> {call.state.custom.description} </span>
        </p>
      )}
      <Link href={"/"} className={buttonClassName}>
        <Home /> Go To Home
      </Link>
    </div>
  );
}

function MeetingEndedScreen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended</p>
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
      <div className="space-y-3">
        <h2 className="text-center text-xl font-bold">Recordings</h2>
        <RecordingsList />
      </div>
    </div>
  );
}
