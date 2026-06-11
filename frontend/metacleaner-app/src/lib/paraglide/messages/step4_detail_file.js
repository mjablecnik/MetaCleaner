/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_FileInputs */

const en_step4_detail_file = /** @type {(inputs: Step4_Detail_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File`)
};

const cs_step4_detail_file = /** @type {(inputs: Step4_Detail_FileInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubor`)
};

/**
* | output |
* | --- |
* | "File" |
*
* @param {Step4_Detail_FileInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_file = /** @type {((inputs?: Step4_Detail_FileInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_FileInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_file(inputs)
	return cs_step4_detail_file(inputs)
});
export { step4_detail_file as "step4.detail.file" }