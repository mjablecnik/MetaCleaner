/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Riskhigh1Inputs */

const en_step5_metadata_riskhigh1 = /** @type {(inputs: Step5_Metadata_Riskhigh1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High`)
};

const cs_step5_metadata_riskhigh1 = /** @type {(inputs: Step5_Metadata_Riskhigh1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vysoké`)
};

/**
* | output |
* | --- |
* | "High" |
*
* @param {Step5_Metadata_Riskhigh1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_riskhigh1 = /** @type {((inputs?: Step5_Metadata_Riskhigh1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Riskhigh1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_riskhigh1(inputs)
	return cs_step5_metadata_riskhigh1(inputs)
});
export { step5_metadata_riskhigh1 as "step5.metadata.riskHigh" }