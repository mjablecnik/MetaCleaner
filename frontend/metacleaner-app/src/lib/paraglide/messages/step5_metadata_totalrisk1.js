/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Totalrisk1Inputs */

const en_step5_metadata_totalrisk1 = /** @type {(inputs: Step5_Metadata_Totalrisk1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Total risk`)
};

const cs_step5_metadata_totalrisk1 = /** @type {(inputs: Step5_Metadata_Totalrisk1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Celkové riziko`)
};

/**
* | output |
* | --- |
* | "Total risk" |
*
* @param {Step5_Metadata_Totalrisk1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_totalrisk1 = /** @type {((inputs?: Step5_Metadata_Totalrisk1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Totalrisk1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_totalrisk1(inputs)
	return cs_step5_metadata_totalrisk1(inputs)
});
export { step5_metadata_totalrisk1 as "step5.metadata.totalRisk" }