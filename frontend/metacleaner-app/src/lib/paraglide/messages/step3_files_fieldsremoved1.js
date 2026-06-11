/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step3_Files_Fieldsremoved1Inputs */

const en_step3_files_fieldsremoved1 = /** @type {(inputs: Step3_Files_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`fields removed`)
};

const cs_step3_files_fieldsremoved1 = /** @type {(inputs: Step3_Files_Fieldsremoved1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`polí odstraněno`)
};

/**
* | output |
* | --- |
* | "fields removed" |
*
* @param {Step3_Files_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_fieldsremoved1 = /** @type {((inputs?: Step3_Files_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step3_files_fieldsremoved1(inputs)
	return cs_step3_files_fieldsremoved1(inputs)
});
export { step3_files_fieldsremoved1 as "step3.files.fieldsRemoved" }