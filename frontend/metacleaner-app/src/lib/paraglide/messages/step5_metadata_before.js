/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_BeforeInputs */

const en_step5_metadata_before = /** @type {(inputs: Step5_Metadata_BeforeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Before cleaning`)
};

const cs_step5_metadata_before = /** @type {(inputs: Step5_Metadata_BeforeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Před čištěním`)
};

/**
* | output |
* | --- |
* | "Before cleaning" |
*
* @param {Step5_Metadata_BeforeInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_before = /** @type {((inputs?: Step5_Metadata_BeforeInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_BeforeInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_before(inputs)
	return cs_step5_metadata_before(inputs)
});
export { step5_metadata_before as "step5.metadata.before" }