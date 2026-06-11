/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Allclean1Inputs */

const en_step5_metadata_allclean1 = /** @type {(inputs: Step5_Metadata_Allclean1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files contain no sensitive metadata.`)
};

const cs_step5_metadata_allclean1 = /** @type {(inputs: Step5_Metadata_Allclean1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory neobsahují žádná citlivá metadata.`)
};

/**
* | output |
* | --- |
* | "Files contain no sensitive metadata." |
*
* @param {Step5_Metadata_Allclean1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_allclean1 = /** @type {((inputs?: Step5_Metadata_Allclean1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Allclean1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_allclean1(inputs)
	return cs_step5_metadata_allclean1(inputs)
});
export { step5_metadata_allclean1 as "step5.metadata.allClean" }