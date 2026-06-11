/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Error_Descriptiondesktop1Inputs */

const en_step4_error_descriptiondesktop1 = /** @type {(inputs: Step4_Error_Descriptiondesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An unexpected error occurred while processing the files. Some files could not be cleaned.`)
};

const cs_step4_error_descriptiondesktop1 = /** @type {(inputs: Step4_Error_Descriptiondesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Během zpracování souborů došlo k neočekávané chybě. Část souborů nebyla vyčištěna.`)
};

/**
* | output |
* | --- |
* | "An unexpected error occurred while processing the files. Some files could not be cleaned." |
*
* @param {Step4_Error_Descriptiondesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_descriptiondesktop1 = /** @type {((inputs?: Step4_Error_Descriptiondesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Descriptiondesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_error_descriptiondesktop1(inputs)
	return cs_step4_error_descriptiondesktop1(inputs)
});
export { step4_error_descriptiondesktop1 as "step4.error.descriptionDesktop" }