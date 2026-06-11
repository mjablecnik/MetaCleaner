/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Status_TitleInputs */

const en_step3_status_title = /** @type {(inputs: Step3_Status_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Processing status`)
};

const cs_step3_status_title = /** @type {(inputs: Step3_Status_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stav zpracování`)
};

/**
* | output |
* | --- |
* | "Processing status" |
*
* @param {Step3_Status_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_title = /** @type {((inputs?: Step3_Status_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_status_title(inputs)
	return cs_step3_status_title(inputs)
});
export { step3_status_title as "step3.status.title" }