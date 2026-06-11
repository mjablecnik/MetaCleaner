/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Header_TitleInputs */

const en_step5_header_title = /** @type {(inputs: Step5_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cleaning complete!`)
};

const cs_step5_header_title = /** @type {(inputs: Step5_Header_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čištění dokončeno!`)
};

/**
* | output |
* | --- |
* | "Cleaning complete!" |
*
* @param {Step5_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_header_title = /** @type {((inputs?: Step5_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_header_title(inputs)
	return cs_step5_header_title(inputs)
});
export { step5_header_title as "step5.header.title" }