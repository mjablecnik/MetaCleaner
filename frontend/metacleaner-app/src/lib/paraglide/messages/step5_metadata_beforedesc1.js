/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Beforedesc1Inputs */

const en_step5_metadata_beforedesc1 = /** @type {(inputs: Step5_Metadata_Beforedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files contained hidden data`)
};

const cs_step5_metadata_beforedesc1 = /** @type {(inputs: Step5_Metadata_Beforedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory obsahovaly skrytá data`)
};

/**
* | output |
* | --- |
* | "Files contained hidden data" |
*
* @param {Step5_Metadata_Beforedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_beforedesc1 = /** @type {((inputs?: Step5_Metadata_Beforedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Beforedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_beforedesc1(inputs)
	return cs_step5_metadata_beforedesc1(inputs)
});
export { step5_metadata_beforedesc1 as "step5.metadata.beforeDesc" }