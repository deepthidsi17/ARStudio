// Single source of truth for the client consent + liability waiver.
//
// IMPORTANT — legal review: This wording is a practical, research-informed
// draft for a Texas home-based beauty business, NOT legal advice. Before you
// rely on it, have a licensed Texas attorney review the RELEASE_TEXT (the
// express-negligence "own negligence" clause) and the minor provisions.
//
// Bump CONSENT_VERSION whenever ANY text below changes. Clients are asked to
// re-sign when their most recent signed version is older than CONSENT_VERSION,
// so the stored record always reflects exactly what they agreed to.

// The business currently operates UNREGISTERED (no LLC/entity), i.e. as a sole
// proprietorship, and services are mobile (performed at the client's location).
// So the release must name the INDIVIDUAL operator, doing business as the trade
// name — releasing a non-existent entity is legally weak.
//
// BUSINESS_NAME is the trade name (DBA). OPERATOR_NAME must be the operator's
// full legal name.
// TODO: set OPERATOR_NAME to your full legal name. If/when you register an LLC,
// change RELEASED_PARTY to the entity name and have an attorney confirm.
export const BUSINESS_NAME = "AR Glam Studio";
export const OPERATOR_NAME = "Deepthi Dondapati";

// The party being released, as it should read in the waiver.
export const RELEASED_PARTY = `${OPERATOR_NAME}, doing business as ${BUSINESS_NAME}`;

// Format: YYYY-MM-DD of the last wording change.
export const CONSENT_VERSION = "2026-07-05";

// --- Intake / health-history questions -------------------------------------

// Free-text fields the client fills in.
export const HEALTH_TEXT_FIELDS = [
  {
    name: "allergies",
    label: "Known allergies",
    placeholder: "e.g. latex, fragrance, nuts, PPD/hair dye, none",
  },
  {
    name: "skinConditions",
    label: "Skin conditions or sensitivities",
    placeholder: "e.g. eczema, rosacea, psoriasis, recent sunburn, none",
  },
  {
    name: "medications",
    label: "Current medications or supplements",
    placeholder: "e.g. blood thinners, antibiotics, none",
  },
] as const;

// Yes/no risk flags — checked means "this applies to me". Each maps to a real
// contraindication for one or more of the services offered.
export const HEALTH_FLAGS = [
  {
    name: "accutaneOrRetinoids",
    label:
      "I am currently using, or recently used, Accutane/isotretinoin or prescription retinoids (Retin-A, tretinoin, adapalene, tazarotene).",
    hint: "These thin the skin and greatly raise the risk of burns and skin-lifting during waxing and facials.",
  },
  {
    name: "pregnantOrNursing",
    label: "I am pregnant or breastfeeding.",
    hint: "Some treatments and chemicals are approached differently during pregnancy/nursing.",
  },
  {
    name: "priorReaction",
    label:
      "I have previously had an allergic or adverse reaction to hair color, henna, waxing, or a facial product.",
    hint: "Please describe below so we can adjust or patch-test.",
  },
  {
    name: "recentProcedures",
    label:
      "I have had a chemical peel, laser, microdermabrasion, or sunburn in the past 2 weeks.",
    hint: "Recently treated skin can react badly to waxing and exfoliating facials.",
  },
] as const;

// --- Per-service risk disclosures ------------------------------------------
// Shown to the client so consent is informed. Keyed loosely by service group.

export const RISK_DISCLOSURES = [
  {
    group: "Facials & exfoliating treatments",
    text:
      "Facials and exfoliating treatments can cause temporary redness, tingling, dryness, breakouts (purging), and — rarely — irritation, allergic contact dermatitis, or chemical burns, especially on sensitive or recently treated skin.",
  },
  {
    group: "Hair color, henna & herbal henna",
    text:
      "Hair color and henna products may contain ingredients such as PPD (para-phenylenediamine) that can cause allergic reactions ranging from itching and rash to, rarely, severe swelling. A patch test 24–48 hours before service is strongly recommended. Results and color can vary with your hair's history.",
  },
  {
    group: "Keratin treatments",
    text:
      "Some smoothing/keratin treatments can release formaldehyde or similar compounds when heated, which may irritate the eyes, skin, and airways. Adequate ventilation is used; please tell us about any respiratory conditions.",
  },
  {
    group: "Waxing & threading",
    text:
      "Waxing and threading can cause redness, tenderness, ingrown hairs, temporary bumps, and — particularly if you use retinoids/Accutane or have sun-damaged skin — skin lifting, abrasion, or burns.",
  },
  {
    group: "Bridal & event makeup",
    text:
      "Cosmetic products may cause irritation or allergic reaction in sensitive individuals. Tell us about product sensitivities before we begin, especially for eyes and lips.",
  },
] as const;

// --- Acknowledgments (checkboxes) ------------------------------------------
// `required: true` ones must be checked before the visit can be saved.

export const ACKNOWLEDGMENTS = [
  {
    name: "accurateHistory",
    required: true,
    label:
      "The health information I have provided is accurate and complete to the best of my knowledge, and I will tell my provider about any changes.",
  },
  {
    name: "understandRisks",
    required: true,
    label:
      "I have read and understand the risks of the services I am receiving today, including possible allergic reactions, skin/scalp irritation, chemical burns, and, for hair color/henna, reactions to ingredients such as PPD.",
  },
  {
    name: "patchTest",
    required: false,
    label:
      "For hair color / henna: I understand a 24–48 hour patch test is recommended. If I choose to proceed without one, I accept responsibility for that choice.",
  },
] as const;

// --- The load-bearing release --------------------------------------------
// Drafted to satisfy Texas's two-prong "fair notice" test: it (1) expressly
// names the business's OWN ordinary negligence (express-negligence doctrine)
// and (2) is rendered conspicuously (bold, all-caps heading, above the
// signature) by the ConsentForm component. It deliberately does NOT attempt
// to waive gross negligence or intentional/reckless conduct, which Texas law
// does not permit a pre-injury release to waive.

export const RELEASE_HEADING = "RELEASE AND WAIVER OF LIABILITY — PLEASE READ CAREFULLY";

export const RELEASE_TEXT = `I understand that the beauty services provided by ${RELEASED_PARTY} carry inherent risks, including but not limited to allergic reactions, skin and scalp irritation, chemical burns, and other injury. Having disclosed my health history and been informed of the risks specific to my services, I knowingly and voluntarily assume those risks. I understand these services may be performed at my own location or at the provider's home studio, and I accept the ordinary risks of the service environment in either setting.

IN EXCHANGE FOR RECEIVING THESE SERVICES, I RELEASE, WAIVE, AND DISCHARGE ${RELEASED_PARTY.toUpperCase()} FROM ANY AND ALL LIABILITY, CLAIMS, AND CAUSES OF ACTION FOR PERSONAL INJURY, PROPERTY DAMAGE, OR OTHER LOSS ARISING FROM OR RELATED TO THESE SERVICES OR MY PRESENCE AT THE PLACE OF SERVICE — INCLUDING CLAIMS CAUSED BY THE PROVIDER'S OWN ORDINARY NEGLIGENCE.

This release does not apply to, and I am not waiving, liability for gross negligence or for intentional or reckless conduct. I confirm that I am signing this agreement freely and that I am 18 years of age or older (or that a parent/guardian is signing on behalf of a minor).`;

export const RELEASE_CHECKBOX_LABEL =
  "I have read and agree to the Release and Waiver of Liability above.";

export const PHOTO_CONSENT_LABEL = `I consent to ${BUSINESS_NAME} photographing my results and using the photos for promotional or marketing purposes. (Optional — you may decline and still receive all services.)`;

// Shapes of the JSON blobs persisted on the Consent record.
export type HealthHistory = {
  allergies?: string;
  skinConditions?: string;
  medications?: string;
  reactionDetails?: string;
  flags?: string[];
};

export type Acknowledgments = Record<string, boolean>;
