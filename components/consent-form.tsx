"use client";

import { useState } from "react";

import {
  ACKNOWLEDGMENTS,
  BUSINESS_NAME,
  CONSENT_VERSION,
  HEALTH_FLAGS,
  HEALTH_TEXT_FIELDS,
  PHOTO_CONSENT_LABEL,
  RELEASE_CHECKBOX_LABEL,
  RELEASE_HEADING,
  RELEASE_TEXT,
  RISK_DISCLOSURES,
} from "@/lib/consent";
import SignaturePad from "@/components/signature-pad";

// Renders the full consent + waiver as named inputs inside the surrounding
// check-in <form>. The server action reads these fields (see saveConsent in
// app/actions.ts). Rendered only when a signature is actually required.
export default function ConsentForm({
  defaultSignerName = "",
}: {
  defaultSignerName?: string;
}) {
  const [isMinor, setIsMinor] = useState(false);

  return (
    <div className="space-y-6 rounded-3xl border border-stone-200 bg-stone-50 p-6">
      <input type="hidden" name="consentProvided" value="true" />
      <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
          Consent &amp; waiver
        </p>
        <h3 className="text-xl font-semibold text-stone-900">
          Health history &amp; consent
        </h3>
        <p className="text-sm text-stone-600">
          Please review and complete before we begin. This keeps you safe and is
          kept on file for {BUSINESS_NAME}.
        </p>
      </div>

      {/* Health history */}
      <div className="space-y-4">
        {HEALTH_TEXT_FIELDS.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label
              className="text-sm font-medium text-stone-700"
              htmlFor={`hh_${field.name}`}
            >
              {field.label}
            </label>
            <input
              id={`hh_${field.name}`}
              name={`hh_${field.name}`}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
            />
          </div>
        ))}

        <fieldset className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
          <legend className="px-1 text-sm font-medium text-stone-700">
            Please check any that apply to you
          </legend>
          {HEALTH_FLAGS.map((flag) => (
            <label
              key={flag.name}
              className="flex items-start gap-3 text-sm text-stone-700"
            >
              <input
                type="checkbox"
                name="hh_flags"
                value={flag.name}
                className="mt-1 h-5 w-5 accent-rose-500"
              />
              <span>
                <span className="block">{flag.label}</span>
                {flag.hint ? (
                  <span className="block text-xs text-stone-500">{flag.hint}</span>
                ) : null}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-stone-700"
            htmlFor="hh_reactionDetails"
          >
            If you checked a prior reaction or have anything else to tell us,
            please describe
          </label>
          <textarea
            id="hh_reactionDetails"
            name="hh_reactionDetails"
            rows={2}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Risk disclosures */}
      <details className="rounded-2xl border border-stone-200 bg-white p-4" open>
        <summary className="cursor-pointer text-sm font-semibold text-stone-800">
          Risks of these services (please read)
        </summary>
        <ul className="mt-3 space-y-3">
          {RISK_DISCLOSURES.map((d) => (
            <li key={d.group} className="text-sm text-stone-600">
              <span className="font-medium text-stone-800">{d.group}.</span>{" "}
              {d.text}
            </li>
          ))}
        </ul>
      </details>

      {/* Acknowledgments */}
      <div className="space-y-3">
        {ACKNOWLEDGMENTS.map((ack) => (
          <label
            key={ack.name}
            className="flex items-start gap-3 text-sm text-stone-700"
          >
            <input
              type="checkbox"
              name={`ack_${ack.name}`}
              required={ack.required}
              className="mt-1 h-5 w-5 accent-rose-500"
            />
            <span>
              {ack.label}
              {ack.required ? <span className="text-rose-500"> *</span> : null}
            </span>
          </label>
        ))}
      </div>

      {/* Conspicuous release — bold, all-caps heading, contrasting box */}
      <div className="space-y-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5">
        <h4 className="text-base font-extrabold uppercase tracking-wide text-stone-900">
          {RELEASE_HEADING}
        </h4>
        <p className="whitespace-pre-line text-sm font-semibold leading-6 text-stone-800">
          {RELEASE_TEXT}
        </p>
        <label className="flex items-start gap-3 text-sm font-semibold text-stone-900">
          <input
            type="checkbox"
            name="releaseAccepted"
            required
            className="mt-1 h-5 w-5 accent-rose-600"
          />
          <span>
            {RELEASE_CHECKBOX_LABEL}
            <span className="text-rose-600"> *</span>
          </span>
        </label>
      </div>

      {/* Minor */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            name="isMinor"
            checked={isMinor}
            onChange={(e) => setIsMinor(e.target.checked)}
            className="mt-1 h-5 w-5 accent-rose-500"
          />
          <span>The client is under 18. A parent or legal guardian is signing.</span>
        </label>
        {isMinor ? (
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-stone-700"
              htmlFor="guardianName"
            >
              Parent / guardian full name{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="guardianName"
              name="guardianName"
              required={isMinor}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              placeholder="Parent or guardian name"
            />
          </div>
        ) : null}
      </div>

      {/* Photo / marketing — separate & optional */}
      <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <input
          type="checkbox"
          name="photoConsent"
          className="mt-1 h-5 w-5 accent-rose-500"
        />
        <span>{PHOTO_CONSENT_LABEL}</span>
      </label>

      {/* Signature */}
      <div className="space-y-3 border-t border-stone-200 pt-5">
        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-stone-700"
            htmlFor="signatureName"
          >
            {isMinor ? "Parent / guardian" : "Your"} full legal name (typed
            signature) <span className="text-rose-500">*</span>
          </label>
          <input
            id="signatureName"
            name="signatureName"
            required
            defaultValue={defaultSignerName}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-lg"
            placeholder="Type full legal name to sign"
          />
          <p className="text-xs text-stone-500">
            Typing your name and saving acts as your legal electronic signature.
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-stone-700">
            Draw signature (optional)
          </span>
          <SignaturePad />
        </div>
      </div>
    </div>
  );
}
