import React from "react";
import type { EventType } from "../../../shared/types.ts";

export interface Step1Props {
  eventType: EventType;
  setEventType: (t: EventType) => void;
  name: string;
  setName: (n: string) => void;
  date: string;
  setDate: (d: string) => void;
  city: string;
  setCity: (c: string) => void;
  errors: Record<string, string>;
}

function EventTypeSelector({
  value,
  onChange,
}: {
  value: EventType;
  onChange: (t: EventType) => void;
}): React.JSX.Element {
  return (
    <fieldset className="border-0 p-0">
      <legend className="block text-sm font-bold text-slate-900">Event Type</legend>
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["wedding", "birthday", "community"] as const).map((t) => (
          <label
            key={t}
            className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold capitalize ${
              value === t
                ? "border-blue-800 bg-blue-50 text-blue-900"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value={t}
              checked={value === t}
              onChange={() => onChange(t)}
              className="h-4 w-4 text-blue-800"
            />
            <span>{t}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function EventDateCityFields({
  date,
  setDate,
  city,
  setCity,
  dateError,
}: {
  date: string;
  setDate: (d: string) => void;
  city: string;
  setCity: (c: string) => void;
  dateError?: string;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="field-date" className="block text-sm font-bold text-slate-900">
          Event Date <span className="text-red-700">*</span>
        </label>
        <input
          id="field-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(dateError)}
          aria-describedby={dateError ? "date-error" : undefined}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
        />
        {dateError ? (
          <p id="date-error" className="mt-1 text-xs font-semibold text-red-700">{dateError}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="field-city" className="block text-sm font-bold text-slate-900">
          City / Location
        </label>
        <input
          id="field-city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
          placeholder="e.g., Austin, TX"
        />
      </div>
    </div>
  );
}

/**
 * Step 1: Event type selection, event name, date, and city.
 */
export function Step1Essentials({
  eventType,
  setEventType,
  name,
  setName,
  date,
  setDate,
  city,
  setCity,
  errors,
}: Step1Props): React.JSX.Element {
  return (
    <div className="mt-4 space-y-5">
      <EventTypeSelector value={eventType} onChange={setEventType} />

      <div>
        <label htmlFor="field-name" className="block text-sm font-bold text-slate-900">
          Event Name <span className="text-red-700">*</span>
        </label>
        <input
          id="field-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors["name"])}
          aria-describedby={errors["name"] ? "name-error" : undefined}
          className="mt-1 block min-h-[44px] w-full rounded-md border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-2"
          placeholder="e.g., Sarah & Michael's Wedding"
        />
        {errors["name"] ? (
          <p id="name-error" className="mt-1 text-xs font-semibold text-red-700">{errors["name"]}</p>
        ) : null}
      </div>

      <EventDateCityFields
        date={date}
        setDate={setDate}
        city={city}
        setCity={setCity}
        dateError={errors["date"]}
      />
    </div>
  );
}
