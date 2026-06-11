/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Risknone1Inputs */

const en_step5_metadata_risknone1 = /** @type {(inputs: Step5_Metadata_Risknone1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`None`)
};

const cs_step5_metadata_risknone1 = /** @type {(inputs: Step5_Metadata_Risknone1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Žádné`)
};

/**
* | output |
* | --- |
* | "None" |
*
* @param {Step5_Metadata_Risknone1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_risknone1 = /** @type {((inputs?: Step5_Metadata_Risknone1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Risknone1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_risknone1(inputs)
	return cs_step5_metadata_risknone1(inputs)
});
export { step5_metadata_risknone1 as "step5.metadata.riskNone" }