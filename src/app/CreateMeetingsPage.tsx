"use client";

import { useUser } from "@clerk/nextjs";
import {
  Call,
  MemberRequest,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Copy, Laptop2, Loader2 } from "lucide-react";
import { useState } from "react";
import { getUerIds } from "./actions";
import Button from "@/components/Button";
import Link from "next/link";

const CreateMeetingsPage = () => {
  const [descriptionInput, setDescriptionInput] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [participantsInput, setParticipantsInput] = useState("");
  const [call, setCall] = useState<Call>();

  const client = useStreamVideoClient();
  const { user } = useUser();

  async function createMeeting() {
    if (!user || !client) return;

    try {
      const id = crypto.randomUUID();

      const callType = participantsInput ? "private-meeting" : "default";

      const call = client.call(callType, id);

      const membersEmails = participantsInput
        .split(",")
        .map((email) => email.trim());

      const memberIds = await getUerIds(membersEmails);

      const members: MemberRequest[] = memberIds
        .map((id) => ({
          user_id: id,
          role: "call_member",
        }))
        .concat({ user_id: user.id, role: "call_member" })
        .filter(
          (v, i, a) => a.findIndex((v2) => v2.user_id === v.user_id) === i,
        );

      const starts_at = new Date(startTimeInput || Date.now()).toISOString();

      await call.getOrCreate({
        data: {
          starts_at,
          members,
          custom: { description: descriptionInput },
        },
      });

      setCall(call);
    } catch (error) {
      console.error(error);
      alert("Something went wrong, try again later");
    }
  }

  if (!user || !client) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="text-center text-3xl font-semibold">
        Welcome {user.username}{" "}
      </h1>

      <div className="mx-auto w-80 space-y-6 rounded-md bg-slate-100 p-5">
        <h2 className="text-center  text-xl font-bold text-[#3b82f6]">
          Create a new meeting
        </h2>
        <DescriptionInput
          value={descriptionInput}
          onChange={setDescriptionInput}
        />
        <StartTimeInput value={startTimeInput} onChange={setStartTimeInput} />
        <ParticipantsInput
          value={participantsInput}
          onChange={setParticipantsInput}
        />
        <Button onClick={createMeeting} className="w-full">
          Create meeting
        </Button>
      </div>

      {call && <MeetingLink call={call} />}
    </div>
  );
};

export default CreateMeetingsPage;

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: InputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-2">
      <p className="font-medium">More info:</p>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked), onChange("");
          }}
        />
        Add description
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Description</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={500}
            className="border- w-full rounded-md border border-gray-300 p-2"
          />
        </label>
      )}
    </div>
  );
}

function StartTimeInput({ value, onChange }: InputProps) {
  const [active, setActive] = useState(false);

  const dateTimeLocalNow = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting start:</div>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Start meeting immediately
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={active}
          onChange={() => {
            setActive(true);
            onChange(dateTimeLocalNow);
          }}
        />
        Start meeting at date/time
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Start time</span>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={dateTimeLocalNow}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </label>
      )}
    </div>
  );
}

function ParticipantsInput({ value, onChange }: InputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-2">
      <div className="font-medium">Participants:</div>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Everyone with link can join
      </label>
      <label className="flex items-center gap-1.5">
        <input type="radio" checked={active} onChange={() => setActive(true)} />
        Private meeting
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Participant emails</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter participant email addresses separated by commas"
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </label>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}

function MeetingLink({ call }: MeetingLinkProps) {
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.id}`;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 font-bold">
          Invitation link:{" "}
          <Link
            href={meetingLink}
            className="flex items-center gap-1 font-medium text-blue-500  transition-all hover:text-blue-700"
          >
            <Laptop2 /> Go To Meeting Room
          </Link>
        </span>
        <span>|| </span>
        <button
          className="flex items-center gap-1 text-blue-500 transition-all hover:text-blue-700"
          title="Copy invitation link"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            alert("Copied to clipboard");
          }}
        >
          <Copy /> Copy Link
        </button>
      </div>
      <a
        href={getMailToLink(
          meetingLink,
          call.state.startsAt,
          call.state.custom.description,
        )}
        target="_blank"
        className="text-blue-500 underline hover:opacity-65"
      >
        Send email invitation
      </a>
    </div>
  );
}

function getMailToLink(
  meetingLink: string,
  startsAt?: Date,
  description?: string,
) {
  const startDateFormatted = startsAt
    ? startsAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : undefined;

  const subject =
    "Join my meeting" + (startDateFormatted ? ` at ${startDateFormatted}` : "");

  const body =
    `Join my meeting at ${meetingLink}.` +
    (startDateFormatted
      ? `\n\nThe meeting starts at ${startDateFormatted}.`
      : "") +
    (description ? `\n\nDescription: ${description}` : "");

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
