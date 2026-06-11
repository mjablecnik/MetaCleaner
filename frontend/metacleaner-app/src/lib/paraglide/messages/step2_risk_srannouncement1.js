/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ score: NonNullable<unknown>, severity: NonNullable<unknown> }} Step2_Risk_Srannouncement1Inputs */

const en_step2_risk_srannouncement1 = /** @type {(inputs: Step2_Risk_Srannouncement1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Risk score: ${i?.score} out of 100. Severity: ${i?.severity}.`)
};

const cs_step2_risk_srannouncement1 = /** @type {(inputs: Step2_Risk_Srannouncement1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Rizikové skóre: ${i?.score} ze 100. Závažnost: ${i?.severity}.`)
};

/**
* | output |
* | --- |
* | "Risk score: {score} out of 100. Severity: {severity}." |
*
* @param {Step2_Risk_Srannouncement1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_srannouncement1 = /** @type {((inputs: Step2_Risk_Srannouncement1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Srannouncement1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_srannouncement1(inputs)
	return cs_step2_risk_srannouncement1(inputs)
});
export { step2_risk_srannouncement1 as "step2.risk.srAnnouncement" }