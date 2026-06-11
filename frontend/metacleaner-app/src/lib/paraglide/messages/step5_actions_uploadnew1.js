/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Actions_Uploadnew1Inputs */

const en_step5_actions_uploadnew1 = /** @type {(inputs: Step5_Actions_Uploadnew1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload new files`)
};

const cs_step5_actions_uploadnew1 = /** @type {(inputs: Step5_Actions_Uploadnew1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nahrát nové soubory`)
};

/**
* | output |
* | --- |
* | "Upload new files" |
*
* @param {Step5_Actions_Uploadnew1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_uploadnew1 = /** @type {((inputs?: Step5_Actions_Uploadnew1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Uploadnew1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_actions_uploadnew1(inputs)
	return cs_step5_actions_uploadnew1(inputs)
});
export { step5_actions_uploadnew1 as "step5.actions.uploadNew" }