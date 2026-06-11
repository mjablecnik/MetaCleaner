/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Progress_OverallInputs */

const en_step3_progress_overall = /** @type {(inputs: Step3_Progress_OverallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Overall progress`)
};

const cs_step3_progress_overall = /** @type {(inputs: Step3_Progress_OverallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celkový průběh`)
};

/**
* | output |
* | --- |
* | "Overall progress" |
*
* @param {Step3_Progress_OverallInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_overall = /** @type {((inputs?: Step3_Progress_OverallInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_OverallInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_progress_overall(inputs)
	return cs_step3_progress_overall(inputs)
});
export { step3_progress_overall as "step3.progress.overall" }