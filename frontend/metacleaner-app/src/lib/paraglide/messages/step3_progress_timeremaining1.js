/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown> }} Step3_Progress_Timeremaining1Inputs */

const en_step3_progress_timeremaining1 = /** @type {(inputs: Step3_Progress_Timeremaining1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`~${i?.time} remaining`)
};

const cs_step3_progress_timeremaining1 = /** @type {(inputs: Step3_Progress_Timeremaining1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`~${i?.time} zbývá`)
};

/**
* | output |
* | --- |
* | "~{time} remaining" |
*
* @param {Step3_Progress_Timeremaining1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_timeremaining1 = /** @type {((inputs: Step3_Progress_Timeremaining1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_Timeremaining1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_progress_timeremaining1(inputs)
	return cs_step3_progress_timeremaining1(inputs)
});
export { step3_progress_timeremaining1 as "step3.progress.timeRemaining" }