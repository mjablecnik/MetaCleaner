/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Detail_Errortime1Inputs */

const en_step4_detail_errortime1 = /** @type {(inputs: Step4_Detail_Errortime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Time of occurrence`)
};

const cs_step4_detail_errortime1 = /** @type {(inputs: Step4_Detail_Errortime1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Čas výskytu`)
};

/**
* | output |
* | --- |
* | "Time of occurrence" |
*
* @param {Step4_Detail_Errortime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_errortime1 = /** @type {((inputs?: Step4_Detail_Errortime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_Errortime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_detail_errortime1(inputs)
	return cs_step4_detail_errortime1(inputs)
});
export { step4_detail_errortime1 as "step4.detail.errorTime" }