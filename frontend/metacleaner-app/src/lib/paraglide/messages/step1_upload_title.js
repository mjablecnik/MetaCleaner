/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Upload_TitleInputs */

const en_step1_upload_title = /** @type {(inputs: Step1_Upload_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload files`)
};

const cs_step1_upload_title = /** @type {(inputs: Step1_Upload_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nahrát soubory`)
};

/**
* | output |
* | --- |
* | "Upload files" |
*
* @param {Step1_Upload_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_title = /** @type {((inputs?: Step1_Upload_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_upload_title(inputs)
	return cs_step1_upload_title(inputs)
});
export { step1_upload_title as "step1.upload.title" }