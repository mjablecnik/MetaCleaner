/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_Errorcode1Inputs */

const en_step4_detail_errorcode1 = /** @type {(inputs: Step4_Detail_Errorcode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error code`)
};

const cs_step4_detail_errorcode1 = /** @type {(inputs: Step4_Detail_Errorcode1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kód chyby`)
};

/**
* | output |
* | --- |
* | "Error code" |
*
* @param {Step4_Detail_Errorcode1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_errorcode1 = /** @type {((inputs?: Step4_Detail_Errorcode1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_Errorcode1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_errorcode1(inputs)
	return cs_step4_detail_errorcode1(inputs)
});
export { step4_detail_errorcode1 as "step4.detail.errorCode" }