/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Allremovedsuccess2Inputs */

const en_step5_metadata_allremovedsuccess2 = /** @type {(inputs: Step5_Metadata_Allremovedsuccess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All sensitive metadata has been successfully removed.`)
};

const cs_step5_metadata_allremovedsuccess2 = /** @type {(inputs: Step5_Metadata_Allremovedsuccess2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Všechna citlivá metadata byla úspěšně odstraněna.`)
};

/**
* | output |
* | --- |
* | "All sensitive metadata has been successfully removed." |
*
* @param {Step5_Metadata_Allremovedsuccess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_allremovedsuccess2 = /** @type {((inputs?: Step5_Metadata_Allremovedsuccess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Allremovedsuccess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_allremovedsuccess2(inputs)
	return cs_step5_metadata_allremovedsuccess2(inputs)
});
export { step5_metadata_allremovedsuccess2 as "step5.metadata.allRemovedSuccess" }