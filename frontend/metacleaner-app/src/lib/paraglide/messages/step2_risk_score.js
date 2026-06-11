/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_ScoreInputs */

const en_step2_risk_score = /** @type {(inputs: Step2_Risk_ScoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Risk Score`)
};

const cs_step2_risk_score = /** @type {(inputs: Step2_Risk_ScoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rizikové skóre`)
};

/**
* | output |
* | --- |
* | "Risk Score" |
*
* @param {Step2_Risk_ScoreInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_score = /** @type {((inputs?: Step2_Risk_ScoreInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_ScoreInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_score(inputs)
	return cs_step2_risk_score(inputs)
});
export { step2_risk_score as "step2.risk.score" }