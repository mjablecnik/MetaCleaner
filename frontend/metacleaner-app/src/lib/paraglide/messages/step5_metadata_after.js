/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_AfterInputs */

const en_step5_metadata_after = /** @type {(inputs: Step5_Metadata_AfterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After cleaning`)
};

const cs_step5_metadata_after = /** @type {(inputs: Step5_Metadata_AfterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Po čištění`)
};

/**
* | output |
* | --- |
* | "After cleaning" |
*
* @param {Step5_Metadata_AfterInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_after = /** @type {((inputs?: Step5_Metadata_AfterInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_AfterInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_after(inputs)
	return cs_step5_metadata_after(inputs)
});
export { step5_metadata_after as "step5.metadata.after" }