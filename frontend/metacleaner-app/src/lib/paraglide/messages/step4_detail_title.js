/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_TitleInputs */

const en_step4_detail_title = /** @type {(inputs: Step4_Detail_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error detail`)
};

const cs_step4_detail_title = /** @type {(inputs: Step4_Detail_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detail chyby`)
};

/**
* | output |
* | --- |
* | "Error detail" |
*
* @param {Step4_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_title = /** @type {((inputs?: Step4_Detail_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_title(inputs)
	return cs_step4_detail_title(inputs)
});
export { step4_detail_title as "step4.detail.title" }