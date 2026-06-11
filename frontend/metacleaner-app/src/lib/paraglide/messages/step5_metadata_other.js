/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_OtherInputs */

const en_step5_metadata_other = /** @type {(inputs: Step5_Metadata_OtherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Other`)
};

const cs_step5_metadata_other = /** @type {(inputs: Step5_Metadata_OtherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ostatní`)
};

/**
* | output |
* | --- |
* | "Other" |
*
* @param {Step5_Metadata_OtherInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_other = /** @type {((inputs?: Step5_Metadata_OtherInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_OtherInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_other(inputs)
	return cs_step5_metadata_other(inputs)
});
export { step5_metadata_other as "step5.metadata.other" }