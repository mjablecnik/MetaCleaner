/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Afterdesc1Inputs */

const en_step5_metadata_afterdesc1 = /** @type {(inputs: Step5_Metadata_Afterdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files are safe to share`)
};

const cs_step5_metadata_afterdesc1 = /** @type {(inputs: Step5_Metadata_Afterdesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory jsou bezpečné ke sdílení`)
};

/**
* | output |
* | --- |
* | "Files are safe to share" |
*
* @param {Step5_Metadata_Afterdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_afterdesc1 = /** @type {((inputs?: Step5_Metadata_Afterdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Afterdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_afterdesc1(inputs)
	return cs_step5_metadata_afterdesc1(inputs)
});
export { step5_metadata_afterdesc1 as "step5.metadata.afterDesc" }