/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_PhaseInputs */

const en_step4_detail_phase = /** @type {(inputs: Step4_Detail_PhaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phase`)
};

const cs_step4_detail_phase = /** @type {(inputs: Step4_Detail_PhaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fáze`)
};

/**
* | output |
* | --- |
* | "Phase" |
*
* @param {Step4_Detail_PhaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_phase = /** @type {((inputs?: Step4_Detail_PhaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_PhaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_phase(inputs)
	return cs_step4_detail_phase(inputs)
});
export { step4_detail_phase as "step4.detail.phase" }