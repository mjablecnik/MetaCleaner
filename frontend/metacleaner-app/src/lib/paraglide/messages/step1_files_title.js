/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step1_Files_TitleInputs */

const en_step1_files_title = /** @type {(inputs: Step1_Files_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Files to process`)
};

const cs_step1_files_title = /** @type {(inputs: Step1_Files_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory ke zpracování`)
};

/**
* | output |
* | --- |
* | "Files to process" |
*
* @param {Step1_Files_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_files_title = /** @type {((inputs?: Step1_Files_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Files_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step1_files_title(inputs)
	return cs_step1_files_title(inputs)
});
export { step1_files_title as "step1.files.title" }