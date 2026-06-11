/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step4_Log_TitleInputs */

const en_step4_log_title = /** @type {(inputs: Step4_Log_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error log`)
};

const cs_step4_log_title = /** @type {(inputs: Step4_Log_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Log chyby`)
};

/**
* | output |
* | --- |
* | "Error log" |
*
* @param {Step4_Log_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_log_title = /** @type {((inputs?: Step4_Log_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Log_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step4_log_title(inputs)
	return cs_step4_log_title(inputs)
});
export { step4_log_title as "step4.log.title" }