/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Status_Uploadprompt1Inputs */

const en_step1_status_uploadprompt1 = /** @type {(inputs: Step1_Status_Uploadprompt1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload files to start cleaning metadata.`)
};

const cs_step1_status_uploadprompt1 = /** @type {(inputs: Step1_Status_Uploadprompt1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nahrajte soubory pro zahájení čištění metadat.`)
};

/**
* | output |
* | --- |
* | "Upload files to start cleaning metadata." |
*
* @param {Step1_Status_Uploadprompt1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_status_uploadprompt1 = /** @type {((inputs?: Step1_Status_Uploadprompt1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Status_Uploadprompt1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_status_uploadprompt1(inputs)
	return cs_step1_status_uploadprompt1(inputs)
});
export { step1_status_uploadprompt1 as "step1.status.uploadPrompt" }