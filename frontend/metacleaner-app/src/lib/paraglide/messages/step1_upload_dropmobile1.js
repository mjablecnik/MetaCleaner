/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Dropmobile1Inputs */

const en_step1_upload_dropmobile1 = /** @type {(inputs: Step1_Upload_Dropmobile1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap to select files`)
};

const cs_step1_upload_dropmobile1 = /** @type {(inputs: Step1_Upload_Dropmobile1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Klepněte pro výběr souborů`)
};

/**
* | output |
* | --- |
* | "Tap to select files" |
*
* @param {Step1_Upload_Dropmobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_dropmobile1 = /** @type {((inputs?: Step1_Upload_Dropmobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Dropmobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_dropmobile1(inputs)
	return cs_step1_upload_dropmobile1(inputs)
});
export { step1_upload_dropmobile1 as "step1.upload.dropMobile" }