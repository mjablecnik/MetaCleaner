/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_Dropdesktop1Inputs */

const en_step1_upload_dropdesktop1 = /** @type {(inputs: Step1_Upload_Dropdesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag files here`)
};

const cs_step1_upload_dropdesktop1 = /** @type {(inputs: Step1_Upload_Dropdesktop1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Přetáhněte soubory sem`)
};

/**
* | output |
* | --- |
* | "Drag files here" |
*
* @param {Step1_Upload_Dropdesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_dropdesktop1 = /** @type {((inputs?: Step1_Upload_Dropdesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Dropdesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_dropdesktop1(inputs)
	return cs_step1_upload_dropdesktop1(inputs)
});
export { step1_upload_dropdesktop1 as "step1.upload.dropDesktop" }